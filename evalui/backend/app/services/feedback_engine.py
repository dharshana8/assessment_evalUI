from typing import List, Dict, Any
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
        High lexical keyword coverage but weak semantic support and NLI entailment.
        """
        high_keywords = lexical_score >= settings.KEYWORD_STUFFING_LEXICAL_MIN
        low_semantic = semantic_score <= settings.KEYWORD_STUFFING_SEMANTIC_MAX
        low_entailment = entailment_score <= settings.KEYWORD_STUFFING_SEMANTIC_MAX

        return bool(high_keywords and (low_semantic or low_entailment))

    @staticmethod
    def generate_criterion_feedback(
        status: str,
        criterion_desc: str,
        missing_keywords: List[str],
        keyword_stuffing: bool,
        evidence_text: str = ""
    ) -> str:
        """
        Generate deterministic explainable feedback for a single criterion evaluation.
        """
        feedback_parts = []

        if keyword_stuffing:
            feedback_parts.append("⚠ Possible Keyword Stuffing Detected: Several rubric keywords were found, but semantic and contextual evidence remains weak or ungrounded.")

        if status == "CONTRADICTED":
            feedback_parts.append("The student's statement directly conflicts with or contradicts the required rubric criterion.")
        elif status == "ENTAILED":
            feedback_parts.append("The criterion is clearly supported and demonstrated by the student's answer.")
        elif status == "PARTIAL":
            feedback_parts.append("The answer partially covers the required concept but misses important details or complete context.")
        else:  # UNSUPPORTED
            feedback_parts.append("This concept was not sufficiently demonstrated or supported in the student's answer.")

        if missing_keywords and status != "ENTAILED":
            missing_str = ", ".join(missing_keywords)
            feedback_parts.append(f"Missing required concepts/keywords: [{missing_str}].")

        return " ".join(feedback_parts)

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
