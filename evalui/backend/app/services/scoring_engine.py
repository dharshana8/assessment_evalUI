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
    def calculate_evidence_strength(
        semantic_score: float,
        entailment_score: float
    ) -> float:
        """
        Calculate composite evidence strength from semantic similarity and NLI entailment.
        """
        sem = max(0.0, min(1.0, semantic_score))
        ent = max(0.0, min(1.0, entailment_score))
        return round(0.5 * sem + 0.5 * ent, 4)

    @staticmethod
    def apply_contradiction_guardrail(
        contradiction_prob: float,
        raw_score: float = 0.0
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
        Guaranteed to never exceed max_marks or fall below 0.0.
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
        Complete criterion mark calculation, status determination, and scoring reason generation.
        """
        evidence_strength = ScoringEngine.calculate_evidence_strength(semantic_score, entailment_score)
        is_contradicted = ScoringEngine.apply_contradiction_guardrail(contradiction_prob, 0.0)

        if is_contradicted:
            reason = (
                f"Contradiction guardrail triggered (contradiction probability {contradiction_prob:.2f} > "
                f"{settings.CONTRADICTION_THRESHOLD:.2f}). 0.0/{max_marks} marks awarded."
            )
            return {
                "awarded_marks": 0.0,
                "normalized_score": 0.0,
                "evidence_strength": evidence_strength,
                "status": "CONTRADICTED",
                "guardrail_triggered": True,
                "scoring_reason": reason
            }

        raw_norm = ScoringEngine.calculate_hybrid_score(
            semantic_score=semantic_score,
            entailment_score=entailment_score,
            lexical_score=lexical_score
        )

        # Requirement 6: Strong entailment or high hybrid score grants full credit
        is_entailed = (
            entailment_score >= 0.70 or
            (entailment_score >= 0.50 and semantic_score >= 0.40) or
            raw_norm >= 0.65
        )

        if is_entailed:
            status = "ENTAILED"
            awarded = max_marks
            reason = (
                f"Full credit ({awarded}/{max_marks}) awarded. Strong entailment ({entailment_score:.2f}) and "
                f"semantic similarity ({semantic_score:.2f}) confirm criterion requirement."
            )
        elif raw_norm >= 0.30 or entailment_score >= 0.30 or semantic_score >= 0.35:
            status = "PARTIAL"
            awarded = ScoringEngine.discretize_marks(raw_norm, max_marks)
            if awarded <= 0.0:
                awarded = round(0.5 * max_marks * 2.0) / 2.0  # At least partial credit for valid partial signal
            reason = (
                f"Partial credit ({awarded}/{max_marks}) awarded based on hybrid evidence score ({raw_norm:.2f}). "
                f"Evidence strength is {evidence_strength:.2f} with concept coverage {lexical_score:.2f}."
            )
        else:
            status = "UNSUPPORTED"
            awarded = 0.0
            reason = (
                f"Insufficient evidence strength (hybrid score {raw_norm:.2f} < 0.30). 0.0/{max_marks} marks awarded."
            )

        return {
            "awarded_marks": awarded,
            "normalized_score": raw_norm,
            "evidence_strength": evidence_strength,
            "status": status,
            "guardrail_triggered": False,
            "scoring_reason": reason
        }

