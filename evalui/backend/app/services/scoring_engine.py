from typing import Dict, Any
from app.core.config import settings

class ScoringEngine:
    @staticmethod
    def calculate_hybrid_score(
        semantic_score: float,
        entailment_score: float,
        lexical_score: float
    ) -> float:
        """
        Compute weighted raw normalized score [0.0, 1.0].
        Weights: 0.45 * semantic + 0.45 * entailment + 0.10 * lexical
        """
        w_sem = settings.WEIGHT_SEMANTIC
        w_ent = settings.WEIGHT_ENTAILMENT
        w_lex = settings.WEIGHT_LEXICAL

        raw_normalized = (
            w_sem * max(0.0, min(1.0, semantic_score)) +
            w_ent * max(0.0, min(1.0, entailment_score)) +
            w_lex * max(0.0, min(1.0, lexical_score))
        )
        return max(0.0, min(1.0, raw_normalized))

    @staticmethod
    def apply_contradiction_guardrail(
        contradiction_prob: float,
        raw_score: float
    ) -> bool:
        """
        Returns True if contradiction guardrail is triggered (> threshold).
        """
        return contradiction_prob > settings.CONTRADICTION_THRESHOLD

    @staticmethod
    def discretize_marks(normalized_score: float, max_marks: float) -> float:
        """
        Discretize continuous normalized score [0, 1] into clean mark bands.
        Support 0.5-mark increments or 0%, 25%, 50%, 75%, 100% bands.
        """
        if max_marks <= 0:
            return 0.0

        if normalized_score >= 0.85:
            band = 1.0
        elif normalized_score >= 0.65:
            band = 0.75
        elif normalized_score >= 0.45:
            band = 0.50
        elif normalized_score >= 0.25:
            band = 0.25
        else:
            band = 0.0

        awarded = round(band * max_marks * 2.0) / 2.0
        return min(max_marks, max(0.0, awarded))

    @staticmethod
    def evaluate_criterion(
        semantic_score: float,
        entailment_score: float,
        contradiction_prob: float,
        lexical_score: float,
        max_marks: float
    ) -> Dict[str, Any]:
        """
        Complete criterion mark calculation & status determination.
        """
        is_contradicted = ScoringEngine.apply_contradiction_guardrail(contradiction_prob, 0.0)

        if is_contradicted:
            return {
                "awarded_marks": 0.0,
                "normalized_score": 0.0,
                "status": "CONTRADICTED",
                "guardrail_triggered": True
            }

        raw_norm = ScoringEngine.calculate_hybrid_score(
            semantic_score=semantic_score,
            entailment_score=entailment_score,
            lexical_score=lexical_score
        )

        awarded = ScoringEngine.discretize_marks(raw_norm, max_marks)

        if raw_norm >= 0.80:
            status = "ENTAILED"
        elif raw_norm >= 0.35:
            status = "PARTIAL"
        else:
            status = "UNSUPPORTED"

        return {
            "awarded_marks": awarded,
            "normalized_score": raw_norm,
            "status": status,
            "guardrail_triggered": False
        }
