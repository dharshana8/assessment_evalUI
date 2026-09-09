import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.db_models import Submission, Assignment, Evaluation, CriterionEvaluation, TeacherOverride
from app.schemas.evaluation import EvaluationResponse, OverrideCreate, CriterionEvaluationResponse, ReliabilitySchema, DuplicateSchema, ConfidenceSchema, InternalEvaluationResult, build_internal_evaluation_result
from app.core.model_manager import model_manager
from app.services.evaluation_engine import EvaluationEngine
from app.services.duplicate_engine import DuplicateEngine
from app.services.confidence_engine import ConfidenceEngine
from app.services.report_service import ReportService
from app.services.text_processor import TextProcessor
from app.services.feedback_engine import FeedbackEngine

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

class EvaluateRequest(BaseModel):
    submission_id: str = Field(..., description="ID of submission to evaluate")

@router.post("", response_model=EvaluationResponse)
@router.post("/evaluate", response_model=EvaluationResponse)
def trigger_evaluation(payload: EvaluateRequest, db: Session = Depends(get_db)):
    if not model_manager.is_ready():
        raise HTTPException(
            status_code=503, 
            detail="AI evaluation engine is still warming up. Please wait a moment."
        )

    submission = db.query(Submission).filter(Submission.id == payload.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Format criteria for evaluation engine
    rubric_list = []
    for c in assignment.rubric_criteria:
        try:
            kws = json.loads(c.keywords) if c.keywords else []
        except Exception:
            kws = [k.strip() for k in str(c.keywords).split(",") if k.strip()]
        
        rubric_list.append({
            "id": c.id,
            "description": c.description,
            "max_marks": c.max_marks,
            "keywords": kws
        })

    # Duplicate detection: check against prior submissions for this assignment (excluding current)
    prior_submissions = db.query(Submission).filter(
        Submission.assignment_id == assignment.id,
        Submission.id != submission.id
    ).all()
    candidate_list = [{"id": s.id, "content": s.content} for s in prior_submissions]
    domain_keywords = [kw for c in rubric_list for kw in (c.get("keywords") or [])]
    dup_engine = DuplicateEngine()
    dup_result = dup_engine.check_duplicate(
        target_text=submission.content,
        candidate_submissions=candidate_list,
        domain_keywords=domain_keywords
    )

    # Run AI evaluation engine
    evaluation_engine = EvaluationEngine()
    eval_result = evaluation_engine.evaluate_submission(
        student_text=submission.content,
        rubric_criteria=rubric_list,
        question=assignment.question,
        reference_answer=assignment.reference_answer,
        duplicate_score=dup_result["duplicate_score"],
        duplicate_type=dup_result["duplicate_type"]
    )

    rel_info = eval_result.get("reliability", {})
    rel_score = rel_info.get("score", 1.0)
    rel_status = rel_info.get("status", "RELIABLE")
    rel_issues = json.dumps(rel_info.get("issues", []))

    conf_info = eval_result.get("confidence", ConfidenceEngine().compute(
        evaluated_criteria=eval_result.get("criteria", []),
        reliability_score=rel_score,
        duplicate_score=dup_result["duplicate_score"],
        duplicate_type=dup_result["duplicate_type"]
    ))

    # Persist in DB
    db_eval = Evaluation(
        submission_id=submission.id,
        total_score=eval_result["total_score"],
        max_score=eval_result["max_score"],
        processing_time=eval_result["processing_time"],
        diagnostic_summary=eval_result["diagnostic_summary"],
        reliability_score=rel_score,
        reliability_status=rel_status,
        reliability_issues=rel_issues,
        duplicate_flag=dup_result["duplicate_flag"],
        duplicate_type=dup_result["duplicate_type"],
        duplicate_score=dup_result["duplicate_score"],
        matched_submission_id=dup_result["matched_submission_id"],
        confidence_score=conf_info.get("confidence_score", 1.0),
        confidence_level=conf_info.get("confidence_level", "HIGH"),
        review_required=conf_info.get("review_required", False),
        confidence_reasons=json.dumps(conf_info.get("reasons", []))
    )
    db.add(db_eval)
    db.flush()

    for c_res in eval_result["criteria"]:
        ev_obj = c_res.get("evidence")
        ev_sent_id = ev_obj["sentence_id"] if ev_obj else None
        ev_text = ev_obj["text"] if ev_obj else None

        db_c_eval = CriterionEvaluation(
            evaluation_id=db_eval.id,
            criterion_id=c_res["criterion_id"],
            awarded_marks=c_res["awarded_marks"],
            semantic_score=c_res["semantic_score"],
            entailment_score=c_res["entailment_score"],
            contradiction_probability=c_res["contradiction_probability"],
            lexical_score=c_res["lexical_score"],
            status=c_res["status"],
            evidence_sentence_id=ev_sent_id,
            evidence_text=ev_text,
            keyword_stuffing_detected=c_res["keyword_stuffing_detected"],
            feedback=c_res["feedback"]
        )
        db.add(db_c_eval)

    db.commit()
    db.refresh(db_eval)

    return get_evaluation(db_eval.id, db)

@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(evaluation_id: str, db: Session = Depends(get_db)):
    db_eval = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not db_eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    submission = db_eval.submission
    assignment = submission.assignment

    sentences = TextProcessor.segment_sentences(submission.content)

    criteria_responses = []
    ai_total_score = 0.0
    final_total_score = 0.0

    for c_eval in db_eval.criterion_evaluations:
        rubric_crit = c_eval.rubric_criterion
        try:
            all_kws = json.loads(rubric_crit.keywords) if rubric_crit.keywords else []
        except Exception:
            all_kws = [k.strip() for k in str(rubric_crit.keywords).split(",") if k.strip()]

        # Check for teacher overrides
        overrides = db.query(TeacherOverride).filter(
            TeacherOverride.criterion_evaluation_id == c_eval.id
        ).order_by(TeacherOverride.created_at.desc()).all()

        latest_override = overrides[0] if overrides else None
        override_val = latest_override.new_score if latest_override else None
        override_reason = latest_override.reason if latest_override else None

        fin_score = override_val if override_val is not None else c_eval.awarded_marks

        ai_total_score += c_eval.awarded_marks
        final_total_score += fin_score

        # Evidence obj
        if c_eval.evidence_sentence_id is not None:
            ev_dict = {
                "sentence_id": c_eval.evidence_sentence_id,
                "text": c_eval.evidence_text or "",
                "similarity": c_eval.semantic_score,
                "entailment": c_eval.entailment_score,
                "contradiction": c_eval.contradiction_probability,
                "status": c_eval.status.lower()
            }
        else:
            ev_dict = None

        fb_data = FeedbackEngine.generate_criterion_feedback_data(
            status=c_eval.status,
            criterion_desc=rubric_crit.description,
            missing_keywords=all_kws if c_eval.status != "ENTAILED" else [],
            keyword_stuffing=c_eval.keyword_stuffing_detected,
            evidence_text=c_eval.evidence_text or "",
            contradiction_prob=c_eval.contradiction_probability,
            awarded_marks=c_eval.awarded_marks,
            max_marks=rubric_crit.max_marks
        )

        ev_str = round(0.5 * c_eval.semantic_score + 0.5 * c_eval.entailment_score, 4)
        sc_reason = (
            f"Contradiction guardrail triggered. 0/{rubric_crit.max_marks} marks awarded." if c_eval.status == "CONTRADICTED"
            else f"Awarded {c_eval.awarded_marks}/{rubric_crit.max_marks} marks based on hybrid score."
        )

        criteria_responses.append(CriterionEvaluationResponse(
            id=c_eval.id,
            criterion_id=rubric_crit.id,
            description=rubric_crit.description,
            criterion_name=rubric_crit.description,
            max_marks=rubric_crit.max_marks,
            awarded_marks=c_eval.awarded_marks,
            semantic_score=c_eval.semantic_score,
            entailment_score=c_eval.entailment_score,
            contradiction_probability=c_eval.contradiction_probability,
            lexical_score=c_eval.lexical_score,
            evidence_strength=ev_str,
            status=c_eval.status,
            evidence=ev_dict,
            supporting_evidence=c_eval.evidence_text if c_eval.evidence_text else None,
            missing_concepts=all_kws if c_eval.status != "ENTAILED" else [],
            contradiction_detail=fb_data.get("contradiction"),
            improvement_suggestion=fb_data.get("improvement_suggestion"),
            scoring_reason=sc_reason,
            keyword_stuffing_detected=c_eval.keyword_stuffing_detected,
            feedback=c_eval.feedback or fb_data["feedback"],
            override_score=override_val,
            override_reason=override_reason
        ))

    pct = round((final_total_score / db_eval.max_score * 100.0), 2) if db_eval.max_score > 0 else 0.0

    try:
        rel_issues_list = json.loads(db_eval.reliability_issues) if db_eval.reliability_issues else []
    except Exception:
        rel_issues_list = []

    rel_schema = ReliabilitySchema(
        score=db_eval.reliability_score if db_eval.reliability_score is not None else 1.0,
        status=db_eval.reliability_status or "RELIABLE",
        issues=rel_issues_list
    )

    dup_schema = DuplicateSchema(
        duplicate_flag=db_eval.duplicate_flag or False,
        duplicate_type=db_eval.duplicate_type or "ORIGINAL",
        duplicate_score=db_eval.duplicate_score or 0.0,
        matched_submission_id=db_eval.matched_submission_id
    )

    try:
        conf_reasons_list = json.loads(db_eval.confidence_reasons) if db_eval.confidence_reasons else []
    except Exception:
        conf_reasons_list = []

    conf_schema = ConfidenceSchema(
        confidence_score=db_eval.confidence_score if db_eval.confidence_score is not None else 1.0,
        confidence_level=db_eval.confidence_level or "HIGH",
        review_required=db_eval.review_required if db_eval.review_required is not None else False,
        reasons=conf_reasons_list
    )

    eval_data_for_internal = {
        "total_score": round(final_total_score, 2),
        "max_score": db_eval.max_score,
        "reliability": rel_schema.model_dump(),
        "confidence": conf_schema.model_dump(),
        "criteria": [c.model_dump() for c in criteria_responses]
    }
    internal_res = build_internal_evaluation_result(eval_data_for_internal, dup_schema.model_dump())

    return EvaluationResponse(
        evaluation_id=db_eval.id,
        submission_id=submission.id,
        assignment_id=assignment.id,
        assignment_title=assignment.title,
        question=assignment.question,
        student_id=submission.student_id or "STUDENT_001",
        student_answer=submission.content,
        total_score=round(ai_total_score, 2),
        final_score=round(final_total_score, 2),
        max_score=db_eval.max_score,
        percentage=pct,
        processing_time=db_eval.processing_time,
        sentences=sentences,
        criteria=criteria_responses,
        diagnostic_summary=db_eval.diagnostic_summary or "",
        reliability=rel_schema,
        duplicate=dup_schema,
        confidence=conf_schema,
        internal_result=internal_res,
        created_at=db_eval.created_at
    )

@router.post("/{evaluation_id}/override", response_model=EvaluationResponse)
def override_criterion_score(
    evaluation_id: str,
    criterion_evaluation_id: str,
    payload: OverrideCreate,
    db: Session = Depends(get_db)
):
    c_eval = db.query(CriterionEvaluation).filter(
        CriterionEvaluation.id == criterion_evaluation_id,
        CriterionEvaluation.evaluation_id == evaluation_id
    ).first()

    if not c_eval:
        raise HTTPException(status_code=404, detail="Criterion evaluation record not found")

    override = TeacherOverride(
        criterion_evaluation_id=c_eval.id,
        original_score=c_eval.awarded_marks,
        new_score=payload.new_score,
        reason=payload.reason,
        teacher_id=payload.teacher_id or "TEACHER_001"
    )
    db.add(override)
    db.commit()

    return get_evaluation(evaluation_id, db)

@router.get("/{evaluation_id}/report")
def get_pdf_report(evaluation_id: str, db: Session = Depends(get_db)):
    eval_resp = get_evaluation(evaluation_id, db)
    eval_dict = eval_resp.model_dump()
    
    pdf_bytes = ReportService.generate_evaluation_pdf(eval_dict)
    
    filename = f"evalui_report_{evaluation_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

from typing import Optional

@router.get("", response_model=List[EvaluationResponse])
def list_evaluations(
    student_id: Optional[str] = None,
    assignment_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Evaluation).join(Submission)
    if student_id:
        query = query.filter(Submission.student_id == student_id)
    if assignment_id:
        query = query.filter(Submission.assignment_id == assignment_id)
    evals = query.order_by(Evaluation.created_at.desc()).all()
    results = []
    for e in evals:
        try:
            results.append(get_evaluation(e.id, db))
        except Exception:
            pass
    return results

