from typing import List, Dict, Any, Optional
from app.core.config import settings


class FeedbackEngine:
    @staticmethod
    def detect_keyword_stuffing(
        lexical_score: float,
        semantic_score: float,
        entailment_score: float
    ) -> bool:
        """
        Detect possible keyword stuffing:
        High lexical keyword coverage (>=0.70) but weak semantic support AND weak NLI entailment.
        Requirement 2 & 6: Coherent sentences with strong semantic or entailment support are NEVER keyword stuffed.
        """
        high_keywords = lexical_score >= settings.KEYWORD_STUFFING_LEXICAL_MIN
        
        # If semantic similarity or entailment shows strong grammatical/conceptual support, it is NOT stuffing
        if semantic_score >= 0.60 or entailment_score >= 0.40:
            return False

        low_semantic = semantic_score <= 0.60
        low_entailment = entailment_score <= 0.40

        return bool(high_keywords and low_semantic and low_entailment)

    @staticmethod
    def generate_criterion_feedback_data(
        status: str,
        criterion_desc: str,
        missing_keywords: List[str],
        keyword_stuffing: bool,
        evidence_text: str = "",
        contradiction_prob: float = 0.0,
        awarded_marks: float = 0.0,
        max_marks: float = 1.0
    ) -> Dict[str, Any]:
        """
        Generate detailed, evidence-grounded, specific, actionable feedback for a single criterion.
        All feedback is derived deterministically from actual evaluation signals — no external LLM.

        Returns structured dictionary containing:
          - criterion_name
          - max_marks
          - awarded_marks
          - status
          - supporting_evidence (supporting sentence)
          - missing_concepts
          - contradiction (if present)
          - improvement_suggestion
          - feedback (combined grounded feedback string)
        """
        crit_name = criterion_desc.strip()
        evidence_clean = evidence_text.strip() if evidence_text else ""
        missing_str = ", ".join(missing_keywords) if missing_keywords else ""

        supporting_sentence = evidence_clean if evidence_clean else None
        contradiction_detail = None
        improvement_suggestion = ""
        feedback_parts = []

        if keyword_stuffing:
            feedback_parts.append("⚠ Keyword stuffing detected: Rubric terms were listed without coherent semantic structure.")

        if status == "ENTAILED":
            if evidence_clean:
                feedback_parts.append(f"Correctly identified: \"{evidence_clean}\" directly supports '{crit_name}'.")
            else:
                feedback_parts.append(f"The requirement for '{crit_name}' is fully satisfied in your response.")

            if missing_keywords:
                improvement_suggestion = f"Consider incorporating additional detail on {missing_str} for maximum technical completeness."
            else:
                improvement_suggestion = "Maintain this level of precision and supporting evidence in your explanations."

        elif status == "PARTIAL":
            if evidence_clean:
                feedback_parts.append(f"Identified partially in answer: \"{evidence_clean}\".")
            else:
                feedback_parts.append(f"The answer partially addresses '{crit_name}'.")

            if missing_keywords:
                feedback_parts.append(f"However, key required concept(s) missing or incomplete: [{missing_str}].")
                improvement_suggestion = f"To earn full credit, explicitly explain how {missing_str} relates to '{crit_name}'."
            else:
                feedback_parts.append("The response lacks sufficient context or depth to satisfy the full rubric criterion.")
                improvement_suggestion = f"Elaborate further on '{crit_name}' with specific explanations and step-by-step detail."

        elif status == "CONTRADICTED":
            if evidence_clean:
                feedback_parts.append(f"Direct contradiction found in answer: \"{evidence_clean}\".")
            else:
                feedback_parts.append(f"The student's statement directly conflicts with '{crit_name}'.")

            contradiction_detail = f"Statement conflicts with factual rubric requirements for '{crit_name}' (contradiction score: {contradiction_prob:.2f})."
            feedback_parts.append(contradiction_detail)

            if missing_keywords:
                improvement_suggestion = f"Correct the contradictory statement and address required concept(s): {missing_str}."
            else:
                improvement_suggestion = f"Review core domain principles for '{crit_name}' and correct the contradictory statement."

        else:  # UNSUPPORTED or REFERENCE_REVIEW_REQUIRED
            if status == "REFERENCE_REVIEW_REQUIRED":
                feedback_parts.append(f"Evaluation suspended for '{crit_name}': Reference answer or rubric requires instructor review.")
                improvement_suggestion = "Pending instructor review of reference answer reliability."
            else:
                feedback_parts.append(f"No supporting evidence found in the student answer for '{crit_name}'.")
                if missing_keywords:
                    feedback_parts.append(f"Missing required concept(s): [{missing_str}].")
                    improvement_suggestion = f"Include a clear explanation addressing '{crit_name}' covering key concept(s): {missing_str}."
                else:
                    improvement_suggestion = f"Provide a direct explanation for '{crit_name}' in your response."

        feedback_parts.append(f"Suggestion: {improvement_suggestion}")
        feedback_text = " ".join(feedback_parts)

        return {
            "criterion_name": crit_name,
            "max_marks": max_marks,
            "awarded_marks": awarded_marks,
            "status": status,
            "supporting_evidence": supporting_sentence,
            "missing_concepts": missing_keywords,
            "contradiction": contradiction_detail,
            "improvement_suggestion": improvement_suggestion,
            "feedback": feedback_text
        }

    @staticmethod
    def generate_criterion_feedback(
        status: str,
        criterion_desc: str,
        missing_keywords: List[str],
        keyword_stuffing: bool,
        evidence_text: str = "",
        contradiction_prob: float = 0.0,
        awarded_marks: float = 0.0,
        max_marks: float = 1.0
    ) -> str:
        """
        Generate deterministic explainable feedback for a single criterion evaluation.
        """
        res = FeedbackEngine.generate_criterion_feedback_data(
            status=status,
            criterion_desc=criterion_desc,
            missing_keywords=missing_keywords,
            keyword_stuffing=keyword_stuffing,
            evidence_text=evidence_text,
            contradiction_prob=contradiction_prob,
            awarded_marks=awarded_marks,
            max_marks=max_marks
        )
        return res["feedback"]

    @staticmethod
    def generate_overall_summary(
        criteria_evals: List[Dict[str, Any]],
        total_score: float,
        max_score: float
    ) -> str:
        """Generate high-level overall summary for student performance."""
        percentage = (total_score / max_score * 100.0) if max_score > 0 else 0.0
        
        contradicted_count = sum(1 for c in criteria_evals if c.get("status") == "CONTRADICTED")
        entailed_count = sum(1 for c in criteria_evals if c.get("status") == "ENTAILED")
        keyword_stuffed_count = sum(1 for c in criteria_evals if c.get("keyword_stuffing_detected"))

        summary = []
        if percentage >= 85:
            summary.append("Excellent answer! The submission demonstrates strong understanding across nearly all rubric criteria.")
        elif percentage >= 60:
            summary.append("Good attempt. Most core concepts are addressed, though some criteria received partial credit.")
        elif percentage >= 30:
            summary.append("Basic understanding shown, but several required rubric criteria are missing or partially explained.")
        else:
            summary.append("The submission does not adequately cover the required concepts or rubric criteria.")

        if contradicted_count > 0:
            summary.append(f"Notice: {contradicted_count} criterion statement(s) contained direct factual contradictions.")

        if keyword_stuffed_count > 0:
            summary.append(f"Warning: Possible keyword stuffing detected in {keyword_stuffed_count} criterion area(s).")

        return " ".join(summary)

