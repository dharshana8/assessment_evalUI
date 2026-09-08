from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class OverrideCreate(BaseModel):
    new_score: float = Field(..., ge=0, description="New instructor-adjusted score")
    reason: str = Field(..., min_length=3, description="Reason for score override")
    teacher_id: Optional[str] = Field(default="TEACHER_001")

class EvidenceSchema(BaseModel):
    sentence_id: int
    text: str
    similarity: float
    entailment: float
    contradiction: float
    status: str

class CriterionEvaluationResponse(BaseModel):
    id: str
    criterion_id: str
    description: str
    criterion_name: Optional[str] = None
    max_marks: float
    awarded_marks: float
    semantic_score: float
    entailment_score: float
    contradiction_probability: float
    lexical_score: float
    evidence_strength: Optional[float] = None
    status: str
    evidence: Optional[EvidenceSchema] = None
    supporting_evidence: Optional[str] = None
    missing_concepts: List[str] = Field(default_factory=list)
    contradiction_detail: Optional[str] = None
    improvement_suggestion: Optional[str] = None
    scoring_reason: Optional[str] = None
    keyword_stuffing_detected: bool = False
    feedback: str
    override_score: Optional[float] = None
    override_reason: Optional[str] = None

class ReliabilitySchema(BaseModel):
    score: float = 1.0
    status: str = "RELIABLE"
    issues: List[str] = Field(default_factory=list)

class DuplicateSchema(BaseModel):
    duplicate_flag: bool = False
    duplicate_type: str = "ORIGINAL"
    duplicate_score: float = 0.0
    matched_submission_id: Optional[str] = None

class ConfidenceSchema(BaseModel):
    confidence_score: float = 1.0
    confidence_level: str = "HIGH"
    review_required: bool = False
    reasons: List[str] = Field(default_factory=list)

class EvidenceItem(BaseModel):
    sentence: str
    support: float

class InternalCriterion(BaseModel):
    criterion_id: str
    max_marks: float
    awarded_marks: float
    status: str
    semantic_score: float
    concept_coverage: float
    evidence: List[EvidenceItem] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    contradiction: bool = False
    feedback: str

class InternalReliability(BaseModel):
    score: float = 1.0
    status: str = "RELIABLE"
    issues: List[str] = Field(default_factory=list)

class InternalDuplicate(BaseModel):
    flag: bool = False
    type: str = "ORIGINAL"
    score: float = 0.0

class InternalConfidence(BaseModel):
    score: float = 1.0
    level: str = "HIGH"
    review_required: bool = False

class InternalEvaluationResult(BaseModel):
    score: float
    max_score: float
    reliability: InternalReliability
    criteria: List[InternalCriterion] = Field(default_factory=list)
    duplicate: InternalDuplicate
    confidence: InternalConfidence

    class Config:
        from_attributes = True

class EvaluationResponse(BaseModel):
    evaluation_id: str
    submission_id: str
    assignment_id: str
    assignment_title: str
    question: str
    student_id: str
    student_answer: str
    total_score: float
    final_score: float  # Includes overrides if present
    max_score: float
    percentage: float
    processing_time: float
    sentences: List[Dict[str, Any]]
    criteria: List[CriterionEvaluationResponse]
    diagnostic_summary: str
    reliability: Optional[ReliabilitySchema] = None
    duplicate: Optional[DuplicateSchema] = None
    confidence: Optional[ConfidenceSchema] = None
    internal_result: Optional[InternalEvaluationResult] = None
    created_at: datetime

    class Config:
        from_attributes = True


def build_internal_evaluation_result(
    eval_data: Dict[str, Any],
    duplicate_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Construct clean internal evaluation result structure for EvalUI transparent reporting.
    """
    score = float(eval_data.get("total_score", eval_data.get("score", 0.0)))
    max_score = float(eval_data.get("max_score", 0.0))

    rel_raw = eval_data.get("reliability", {})
    reliability = {
        "score": float(rel_raw.get("score", 1.0)),
        "status": str(rel_raw.get("status", "RELIABLE")),
        "issues": list(rel_raw.get("issues", []))
    }

    dup_raw = duplicate_info or eval_data.get("duplicate") or {}
    duplicate = {
        "flag": bool(dup_raw.get("duplicate_flag", dup_raw.get("flag", False))),
        "type": str(dup_raw.get("duplicate_type", dup_raw.get("type", "ORIGINAL"))),
        "score": float(dup_raw.get("duplicate_score", dup_raw.get("score", 0.0)))
    }

    conf_raw = eval_data.get("confidence", {})
    confidence = {
        "score": float(conf_raw.get("confidence_score", conf_raw.get("score", 1.0))),
        "level": str(conf_raw.get("confidence_level", conf_raw.get("level", "HIGH"))),
        "review_required": bool(conf_raw.get("review_required", False))
    }

    criteria_list = []
    for crit in eval_data.get("criteria", []):
        crit_id = str(crit.get("criterion_id", crit.get("id", "")))
        c_max = float(crit.get("max_marks", 1.0))
        c_awarded = float(crit.get("awarded_marks", 0.0))
        c_status = str(crit.get("status", "UNSUPPORTED"))
        sem_score = float(crit.get("semantic_score", 0.0))
        concept_cov = float(crit.get("lexical_score", crit.get("concept_coverage", 0.0)))

        evidence_items = []
        ev_obj = crit.get("evidence")
        if ev_obj:
            if isinstance(ev_obj, dict):
                s_text = ev_obj.get("text", ev_obj.get("sentence", ""))
                supp_val = float(ev_obj.get("similarity", ev_obj.get("support", sem_score)))
                if s_text:
                    evidence_items.append({"sentence": s_text, "support": supp_val})
            elif isinstance(ev_obj, list):
                for item in ev_obj:
                    if isinstance(item, dict):
                        s_text = item.get("text", item.get("sentence", ""))
                        supp_val = float(item.get("similarity", item.get("support", sem_score)))
                        if s_text:
                            evidence_items.append({"sentence": s_text, "support": supp_val})

        missing_kws = list(crit.get("missing_concepts", []))
        contra_flag = bool(c_status == "CONTRADICTED" or float(crit.get("contradiction_probability", 0.0)) > 0.60)
        fb = str(crit.get("feedback", ""))

        criteria_list.append({
            "criterion_id": crit_id,
            "max_marks": c_max,
            "awarded_marks": c_awarded,
            "status": c_status,
            "semantic_score": sem_score,
            "concept_coverage": concept_cov,
            "evidence": evidence_items,
            "missing_concepts": missing_kws,
            "contradiction": contra_flag,
            "feedback": fb
        })

    return {
        "score": score,
        "max_score": max_score,
        "reliability": reliability,
        "criteria": criteria_list,
        "duplicate": duplicate,
        "confidence": confidence
    }
