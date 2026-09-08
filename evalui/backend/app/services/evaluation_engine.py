import time
from typing import List, Dict, Any, Optional
from app.services.text_processor import TextProcessor
from app.services.similarity_engine import SimilarityEngine
from app.services.nli_engine import NLIEngine
from app.services.lexical_engine import LexicalEngine
from app.services.scoring_engine import ScoringEngine
from app.services.feedback_engine import FeedbackEngine
from app.services.reliability_engine import ReliabilityEngine
from app.services.confidence_engine import ConfidenceEngine
from app.schemas.evaluation import build_internal_evaluation_result
from app.core.logging_config import logger

class EvaluationEngine:
    def __init__(self):
        self._similarity_engine = None
        self._nli_engine = None
        self._reliability_engine = None

    @property
    def similarity_engine(self) -> SimilarityEngine:
        if self._similarity_engine is None:
            self._similarity_engine = SimilarityEngine()
        return self._similarity_engine

    @property
    def nli_engine(self) -> NLIEngine:
        if self._nli_engine is None:
            self._nli_engine = NLIEngine()
        return self._nli_engine

    @property
    def reliability_engine(self) -> ReliabilityEngine:
        if self._reliability_engine is None:
            self._reliability_engine = ReliabilityEngine()
        return self._reliability_engine

    def evaluate_submission(
        self,
        student_text: str,
        rubric_criteria: List[Dict[str, Any]],
        question: Optional[str] = None,
        reference_answer: Optional[str] = None,
        duplicate_score: float = 0.0,
        duplicate_type: str = "ORIGINAL"
    ) -> Dict[str, Any]:
        """
        Full end-to-end evaluation pipeline with PS2 Reliability Gate check.
        """
        start_time = time.time()
        
        # 0. PS2 Reliability Gate Verification
        ref_text = reference_answer if (reference_answer and reference_answer.strip()) else " ".join([c.get("description", "") for c in rubric_criteria])
        rel_res = self.reliability_engine.evaluate_reliability(
            reference_answer=ref_text,
            question=question,
            rubric_criteria=rubric_criteria
        )

        sentences_struct = TextProcessor.segment_sentences(student_text)
        sentence_texts = [s["text"] for s in sentences_struct]

        # Rule 4: If status == UNRELIABLE -> DO NOT generate normal score. Mark as REFERENCE_REVIEW_REQUIRED
        if rel_res["status"] == "UNRELIABLE":
            max_score = sum(float(crit.get("max_marks", 1.0)) for crit in rubric_criteria)
            unreliable_criteria = []
            for crit in rubric_criteria:
                unreliable_criteria.append({
                    "criterion_id": str(crit.get("id", "")),
                    "description": str(crit.get("description", "")),
                    "max_marks": float(crit.get("max_marks", 1.0)),
                    "awarded_marks": 0.0,
                    "semantic_score": 0.0,
                    "entailment_score": 0.0,
                    "contradiction_probability": 0.0,
                    "lexical_score": 0.0,
                    "status": "REFERENCE_REVIEW_REQUIRED",
                    "evidence": None,
                    "missing_concepts": crit.get("keywords", []),
                    "keyword_stuffing_detected": False,
                    "feedback": "Evaluation suspended: Reference answer or rubric failed internal reliability checks."
                })
            
            processing_time = time.time() - start_time

            # Confidence: LOW because reference is unreliable — no meaningful evidence signals
            confidence_result = ConfidenceEngine().compute(
                evaluated_criteria=[],
                reliability_score=rel_res["reliability_score"],
                duplicate_score=duplicate_score,
                duplicate_type=duplicate_type,
            )

            res_dict = {
                "total_score": 0.0,
                "max_score": max_score,
                "percentage": 0.0,
                "processing_time": round(processing_time, 4),
                "sentences": sentences_struct,
                "criteria": unreliable_criteria,
                "diagnostic_summary": f"REFERENCE_REVIEW_REQUIRED: Reference answer/rubric has internal reliability issues ({'; '.join(rel_res['issues'])}). Evaluation suspended pending instructor review.",
                "reliability": {
                    "score": rel_res["reliability_score"],
                    "status": "REFERENCE_REVIEW_REQUIRED",
                    "issues": rel_res["issues"]
                },
                "confidence": confidence_result,
            }
            res_dict["internal_result"] = build_internal_evaluation_result(res_dict, {"duplicate_score": duplicate_score, "duplicate_type": duplicate_type})
            return res_dict

        # Handle empty submission edge case
        if not student_text or not student_text.strip() or not sentences_struct:
            empty_criteria_evals = []
            max_score = 0.0
            for crit in rubric_criteria:
                crit_max = float(crit.get("max_marks", 1.0))
                max_score += crit_max
                empty_criteria_evals.append({
                    "criterion_id": str(crit.get("id", "")),
                    "description": str(crit.get("description", "")),
                    "max_marks": crit_max,
                    "awarded_marks": 0.0,
                    "semantic_score": 0.0,
                    "entailment_score": 0.0,
                    "contradiction_probability": 0.0,
                    "lexical_score": 0.0,
                    "status": "UNSUPPORTED",
                    "evidence": None,
                    "missing_concepts": crit.get("keywords", []),
                    "keyword_stuffing_detected": False,
                    "feedback": "Empty submission provided. 0 marks awarded."
                })
            
            processing_time = time.time() - start_time
            res_dict = {
                "total_score": 0.0,
                "max_score": max_score,
                "percentage": 0.0,
                "processing_time": round(processing_time, 4),
                "sentences": [],
                "criteria": empty_criteria_evals,
                "diagnostic_summary": "Empty submission provided. 0 marks awarded.",
                "confidence": {
                    "confidence_score": 0.0,
                    "confidence_level": "LOW",
                    "review_required": True,
                    "reasons": ["Empty submission — no signals available."],
                },
            }
            res_dict["internal_result"] = build_internal_evaluation_result(res_dict, {"duplicate_score": duplicate_score, "duplicate_type": duplicate_type})
            return res_dict

        evaluated_criteria = []
        total_awarded = 0.0
        total_max = 0.0

        # Precompute student sentence embeddings ONCE for all criteria (Singleton reuse)
        sentence_embs = self.similarity_engine.encode_sentences(sentence_texts)

        for crit in rubric_criteria:
            crit_id = str(crit.get("id", ""))
            crit_desc = str(crit.get("description", ""))
            crit_max = float(crit.get("max_marks", 1.0))
            crit_keywords = crit.get("keywords", [])
            if isinstance(crit_keywords, str):
                crit_keywords = [k.strip() for k in crit_keywords.split(",") if k.strip()]

            total_max += crit_max

            # 2. Semantic Similarity using precomputed embeddings
            sim_scores = self.similarity_engine.compute_similarity_with_embs(crit_desc, sentence_embs)

            # 3. Lexical coverage analysis
            lex_score, present_kws, missing_kws = LexicalEngine.evaluate_keywords(
                crit_keywords, student_text
            )

            # 4. Batch NLI analysis for all candidate sentences
            nli_results = self.nli_engine.evaluate_sentences(hypothesis=crit_desc, premises=sentence_texts)

            best_candidate_idx = -1
            best_combined_val = -1.0
            best_nli_res = {"entailment": 0.0, "contradiction": 0.0, "neutral": 1.0}

            for idx, s_text in enumerate(sentence_texts):
                sim_val = sim_scores[idx] if idx < len(sim_scores) else 0.0
                nli_res = nli_results[idx] if idx < len(nli_results) else {"entailment": 0.0, "contradiction": 0.0, "neutral": 1.0}

                selection_val = 0.5 * sim_val + 0.5 * (nli_res["entailment"] + nli_res["contradiction"])
                
                if nli_res["contradiction"] > 0.60:
                    best_candidate_idx = idx
                    best_nli_res = nli_res
                    break

                if selection_val > best_combined_val:
                    best_combined_val = selection_val
                    best_candidate_idx = idx
                    best_nli_res = nli_res

            if best_candidate_idx >= 0:
                best_sentence = sentences_struct[best_candidate_idx]
                best_sim = sim_scores[best_candidate_idx]
            else:
                best_sentence = None
                best_sim = 0.0

            contra_prob = best_nli_res["contradiction"]
            entail_prob = best_nli_res["entailment"]


            # 4. Scoring Engine
            scoring_res = ScoringEngine.evaluate_criterion(
                semantic_score=best_sim,
                entailment_score=entail_prob,
                contradiction_prob=contra_prob,
                lexical_score=lex_score,
                max_marks=crit_max
            )

            awarded = scoring_res["awarded_marks"]
            status = scoring_res["status"]
            ev_strength = scoring_res.get("evidence_strength", round(0.5 * best_sim + 0.5 * entail_prob, 4))
            scoring_reason = scoring_res.get("scoring_reason", "")

            # 5. Keyword Stuffing Detector
            keyword_stuffing = FeedbackEngine.detect_keyword_stuffing(
                lexical_score=lex_score,
                semantic_score=best_sim,
                entailment_score=entail_prob
            )

            # 6. Evidence Structuring
            if best_sentence is not None:
                evidence_obj = {
                    "sentence_id": best_sentence["sentence_id"],
                    "text": best_sentence["text"],
                    "similarity": round(best_sim, 4),
                    "entailment": round(entail_prob, 4),
                    "contradiction": round(contra_prob, 4),
                    "status": status.lower()
                }
            else:
                evidence_obj = None

            # 7. Generate Feedback
            feedback_data = FeedbackEngine.generate_criterion_feedback_data(
                status=status,
                criterion_desc=crit_desc,
                missing_keywords=missing_kws,
                keyword_stuffing=keyword_stuffing,
                evidence_text=best_sentence["text"] if best_sentence else "",
                contradiction_prob=contra_prob,
                awarded_marks=awarded,
                max_marks=crit_max
            )

            total_awarded += awarded

            evaluated_criteria.append({
                "criterion_id": crit_id,
                "description": crit_desc,
                "criterion_name": crit_desc,
                "max_marks": crit_max,
                "awarded_marks": awarded,
                "semantic_score": round(best_sim, 4),
                "entailment_score": round(entail_prob, 4),
                "contradiction_probability": round(contra_prob, 4),
                "lexical_score": round(lex_score, 4),
                "evidence_strength": ev_strength,
                "status": status,
                "evidence": evidence_obj,
                "supporting_evidence": best_sentence["text"] if best_sentence else None,
                "missing_concepts": missing_kws,
                "contradiction_detail": feedback_data.get("contradiction"),
                "improvement_suggestion": feedback_data.get("improvement_suggestion"),
                "scoring_reason": scoring_reason,
                "keyword_stuffing_detected": keyword_stuffing,
                "feedback": feedback_data["feedback"]
            })

        processing_time = time.time() - start_time
        logger.info(f"Evaluation pipeline completed in {processing_time:.3f}s for {len(rubric_criteria)} criteria and {len(sentence_texts)} sentences.")
        final_awarded = min(total_max, max(0.0, total_awarded))

        percentage = round((final_awarded / total_max * 100.0), 2) if total_max > 0 else 0.0

        overall_summary = FeedbackEngine.generate_overall_summary(
            evaluated_criteria, total_awarded, total_max
        )
        if rel_res["status"] == "REVIEW_REQUIRED":
            overall_summary = "[REQUIRES INSTRUCTOR REVIEW] " + overall_summary

        # Confidence computation — runs after all criteria are evaluated
        confidence_result = ConfidenceEngine().compute(
            evaluated_criteria=evaluated_criteria,
            reliability_score=rel_res.get("reliability_score", 1.0),
            duplicate_score=duplicate_score,
            duplicate_type=duplicate_type,
        )

        res_dict = {
            "total_score": round(final_awarded, 2),
            "max_score": round(total_max, 2),
            "percentage": percentage,
            "processing_time": round(processing_time, 4),
            "sentences": sentences_struct,
            "criteria": evaluated_criteria,
            "diagnostic_summary": overall_summary,
            "reliability": {
                "score": rel_res["reliability_score"],
                "status": rel_res["status"],
                "issues": rel_res["issues"]
            },
            "confidence": confidence_result,
        }
        res_dict["internal_result"] = build_internal_evaluation_result(res_dict, {"duplicate_score": duplicate_score, "duplicate_type": duplicate_type})
        return res_dict
