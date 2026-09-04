import time
from typing import List, Dict, Any
from app.services.text_processor import TextProcessor
from app.services.similarity_engine import SimilarityEngine
from app.services.nli_engine import NLIEngine
from app.services.lexical_engine import LexicalEngine
from app.services.scoring_engine import ScoringEngine
from app.services.feedback_engine import FeedbackEngine
from app.core.logging_config import logger

class EvaluationEngine:
    def __init__(self):
        self._similarity_engine = None
        self._nli_engine = None

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

    def evaluate_submission(
        self,
        student_text: str,
        rubric_criteria: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Full end-to-end evaluation pipeline for a student submission against a rubric.
        """
        start_time = time.time()
        
        # 1. Sentence segmentation
        sentences_struct = TextProcessor.segment_sentences(student_text)
        sentence_texts = [s["text"] for s in sentences_struct]

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
            return {
                "total_score": 0.0,
                "max_score": max_score,
                "percentage": 0.0,
                "processing_time": round(processing_time, 4),
                "sentences": [],
                "criteria": empty_criteria_evals,
                "diagnostic_summary": "Empty submission provided. 0 marks awarded."
            }

        evaluated_criteria = []
        total_awarded = 0.0
        total_max = 0.0

        for crit in rubric_criteria:
            crit_id = str(crit.get("id", ""))
            crit_desc = str(crit.get("description", ""))
            crit_max = float(crit.get("max_marks", 1.0))
            crit_keywords = crit.get("keywords", [])
            if isinstance(crit_keywords, str):
                crit_keywords = [k.strip() for k in crit_keywords.split(",") if k.strip()]

            total_max += crit_max

            # 2. Semantic Similarity against all candidate sentences
            sim_scores = self.similarity_engine.compute_similarity(crit_desc, sentence_texts)

            # 3. Lexical coverage analysis
            lex_score, present_kws, missing_kws = LexicalEngine.evaluate_keywords(
                crit_keywords, student_text
            )

            # Find candidates with high semantic or keyword match for NLI deep inspection
            best_candidate_idx = -1
            best_combined_val = -1.0
            best_nli_res = {"entailment": 0.0, "contradiction": 0.0, "neutral": 1.0}

            # NLI analysis for top candidate sentences
            for idx, s_text in enumerate(sentence_texts):
                sim_val = sim_scores[idx]
                nli_res = self.nli_engine.evaluate_pair(premise=s_text, hypothesis=crit_desc)

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
            feedback_text = FeedbackEngine.generate_criterion_feedback(
                status=status,
                criterion_desc=crit_desc,
                missing_keywords=missing_kws,
                keyword_stuffing=keyword_stuffing,
                evidence_text=best_sentence["text"] if best_sentence else ""
            )

            total_awarded += awarded

            evaluated_criteria.append({
                "criterion_id": crit_id,
                "description": crit_desc,
                "max_marks": crit_max,
                "awarded_marks": awarded,
                "semantic_score": round(best_sim, 4),
                "entailment_score": round(entail_prob, 4),
                "contradiction_probability": round(contra_prob, 4),
                "lexical_score": round(lex_score, 4),
                "status": status,
                "evidence": evidence_obj,
                "missing_concepts": missing_kws,
                "keyword_stuffing_detected": keyword_stuffing,
                "feedback": feedback_text
            })

        processing_time = time.time() - start_time
        percentage = round((total_awarded / total_max * 100.0), 2) if total_max > 0 else 0.0

        overall_summary = FeedbackEngine.generate_overall_summary(
            evaluated_criteria, total_awarded, total_max
        )

        return {
            "total_score": round(total_awarded, 2),
            "max_score": round(total_max, 2),
            "percentage": percentage,
            "processing_time": round(processing_time, 4),
            "sentences": sentences_struct,
            "criteria": evaluated_criteria,
            "diagnostic_summary": overall_summary
        }
