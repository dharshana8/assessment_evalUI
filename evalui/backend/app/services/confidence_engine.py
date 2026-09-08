"""
Confidence Engine — Local Evaluation Confidence Engine
======================================================
Derives a calibrated evaluation confidence score entirely from real,
local evaluation signals.  No randomness.  No external APIs.

Signals consumed:
  - semantic similarity (mean semantic_score across criteria)
  - NLI / entailment strength (mean entailment_score across criteria)
  - lexical / concept coverage (mean lexical_score across criteria)
  - contradiction presence (mean contradiction_probability across criteria)
  - rubric criterion coverage (fraction of criteria supported / awarded)
  - disagreement between scoring signals (stdev of semantic, entailment, lexical)
  - reliability score of the reference (0-1 from ReliabilityEngine)
  - duplicate risk (0-1 score & risk type from DuplicateEngine)
  - keyword stuffing presence (fraction of stuffed criteria)

Return shape:
{
  "confidence_score": 0.87,
  "confidence_level": "HIGH",
  "review_required": false,
  "reasons": []
}

Levels: HIGH (>= 0.75), MEDIUM (0.50 - 0.74), LOW (< 0.50)
"""
import statistics
from typing import List, Dict, Any


class ConfidenceEngine:
    """
    Derives a calibrated confidence score from real evaluation signals.
    All weights and thresholds are configurable constructor parameters.
    """

    _HIGH_RISK_DUP_TYPES = {"EXACT_COPY", "NEAR_DUPLICATE"}

    def __init__(
        self,
        w_semantic: float = 0.30,
        w_entailment: float = 0.30,
        w_lexical: float = 0.20,
        w_criterion_coverage: float = 0.20,
        w_reliability: float = 0.35,
        w_contradiction: float = 0.35,
        w_disagreement: float = 0.25,
        w_stuffing: float = 0.15,
        w_duplicate: float = 0.25,
        high_threshold: float = 0.75,
        medium_threshold: float = 0.50,
    ):
        self.w_semantic = w_semantic
        self.w_entailment = w_entailment
        self.w_lexical = w_lexical
        self.w_criterion_coverage = w_criterion_coverage
        self.w_reliability = w_reliability
        self.w_contradiction = w_contradiction
        self.w_disagreement = w_disagreement
        self.w_stuffing = w_stuffing
        self.w_duplicate = w_duplicate
        self.high_threshold = high_threshold
        self.medium_threshold = medium_threshold

    @staticmethod
    def _safe_mean(values: List[float]) -> float:
        return statistics.mean(values) if values else 0.0

    @staticmethod
    def _signal_disagreement(semantic: float, entailment: float, lexical: float) -> float:
        """
        Standard deviation of the three main per-criterion scoring signals.
        High std-dev means the three models disagree -> lower confidence.
        Clamped to [0, 1].
        """
        try:
            return min(1.0, statistics.stdev([semantic, entailment, lexical]))
        except statistics.StatisticsError:
            return 0.0

    def _duplicate_penalty(self, duplicate_score: float, duplicate_type: str) -> float:
        """
        Scale duplicate_score by risk tier:
          EXACT_COPY / NEAR_DUPLICATE -> full score as penalty
          POSSIBLE_SIMILARITY         -> 40% of score
          ORIGINAL                    -> 0
        """
        if duplicate_type in self._HIGH_RISK_DUP_TYPES:
            return duplicate_score
        if duplicate_type == "POSSIBLE_SIMILARITY":
            return duplicate_score * 0.40
        return 0.0

    def compute(
        self,
        evaluated_criteria: List[Dict[str, Any]],
        reliability_score: float = 1.0,
        duplicate_score: float = 0.0,
        duplicate_type: str = "ORIGINAL",
    ) -> Dict[str, Any]:
        """
        Compute evaluation confidence from already-evaluated criteria + global signals.

        Parameters
        ----------
        evaluated_criteria : list of criterion result dicts from EvaluationEngine.
            Each must contain:
                semantic_score, entailment_score, contradiction_probability,
                lexical_score, keyword_stuffing_detected, status, awarded_marks
        reliability_score  : float [0-1] from ReliabilityEngine.
        duplicate_score    : float [0-1] from DuplicateEngine.
        duplicate_type     : str ("ORIGINAL", "POSSIBLE_SIMILARITY", "NEAR_DUPLICATE", "EXACT_COPY").

        Returns
        -------
        {
            "confidence_score"  : float,
            "confidence_level"  : "HIGH" | "MEDIUM" | "LOW",
            "review_required"   : bool,
            "reasons"           : List[str]
        }
        """
        if not evaluated_criteria:
            return {
                "confidence_score": 0.0,
                "confidence_level": "LOW",
                "review_required": True,
                "reasons": ["No criterion evaluations available to derive confidence."],
            }

        semantic_scores: List[float] = []
        entailment_scores: List[float] = []
        lexical_scores: List[float] = []
        contradiction_scores: List[float] = []
        disagreement_scores: List[float] = []
        stuffing_count = 0
        covered_count = 0

        for crit in evaluated_criteria:
            sem = float(crit.get("semantic_score", 0.0))
            ent = float(crit.get("entailment_score", 0.0))
            lex = float(crit.get("lexical_score", 0.0))
            con = float(crit.get("contradiction_probability", 0.0))
            stuffed = bool(crit.get("keyword_stuffing_detected", False))
            status = str(crit.get("status", "")).upper()
            awarded = float(crit.get("awarded_marks", 0.0))

            semantic_scores.append(sem)
            entailment_scores.append(ent)
            lexical_scores.append(lex)
            contradiction_scores.append(con)
            disagreement_scores.append(self._signal_disagreement(sem, ent, lex))

            if stuffed:
                stuffing_count += 1
            if status in ("ENTAILED", "PARTIAL") or awarded > 0:
                covered_count += 1

        n = len(evaluated_criteria)
        stuffing_fraction = stuffing_count / n if n > 0 else 0.0
        criterion_coverage = covered_count / n if n > 0 else 0.0

        mean_sem = self._safe_mean(semantic_scores)
        mean_ent = self._safe_mean(entailment_scores)
        mean_lex = self._safe_mean(lexical_scores)
        mean_con = self._safe_mean(contradiction_scores)
        mean_dis = self._safe_mean(disagreement_scores)
        dup_pen = self._duplicate_penalty(duplicate_score, duplicate_type)
        rel_pen = (1.0 - max(0.0, min(1.0, reliability_score)))

        positive_component = (
            self.w_semantic * mean_sem
            + self.w_entailment * mean_ent
            + self.w_lexical * mean_lex
            + self.w_criterion_coverage * criterion_coverage
        )

        penalty_component = (
            self.w_contradiction * mean_con
            + self.w_disagreement * mean_dis
            + self.w_stuffing * stuffing_fraction
            + self.w_duplicate * dup_pen
            + self.w_reliability * rel_pen
        )

        raw_score = positive_component - penalty_component
        score = round(max(0.0, min(1.0, raw_score)), 4)

        if score >= self.high_threshold:
            level = "HIGH"
            review_required = False
        elif score >= self.medium_threshold:
            level = "MEDIUM"
            review_required = False
        else:
            level = "LOW"
            review_required = True

        reasons: List[str] = []

        if mean_sem >= 0.75:
            reasons.append(f"Strong semantic agreement across criteria (avg {mean_sem:.2f}).")
        elif mean_sem < 0.40:
            reasons.append(f"Weak semantic similarity across criteria (avg {mean_sem:.2f}).")

        if mean_ent >= 0.60:
            reasons.append(f"High NLI entailment strength (avg {mean_ent:.2f}).")
        elif mean_ent < 0.25:
            reasons.append(f"Low NLI entailment strength (avg {mean_ent:.2f}).")

        if mean_con > 0.30:
            reasons.append(f"Contradiction detected in evaluation criteria (avg {mean_con:.2f}).")

        if mean_lex >= 0.70:
            reasons.append(f"High lexical/concept coverage (avg {mean_lex:.2f}).")
        elif mean_lex < 0.40:
            reasons.append(f"Weak lexical/concept coverage (avg {mean_lex:.2f}).")

        if criterion_coverage >= 0.80:
            reasons.append(f"High rubric criterion coverage ({covered_count}/{n} criteria supported).")
        elif criterion_coverage < 0.50:
            reasons.append(f"Low rubric criterion coverage ({covered_count}/{n} criteria supported).")

        if mean_dis > 0.25:
            reasons.append(f"Large disagreement between scoring signals (avg std {mean_dis:.2f}).")

        if stuffing_fraction > 0:
            reasons.append(f"Keyword stuffing detected in {stuffing_count}/{n} criteria.")

        if reliability_score < 0.60:
            reasons.append(f"Low reference answer reliability ({reliability_score:.2f}).")

        if dup_pen > 0.0:
            reasons.append(f"Duplicate risk detected (type: {duplicate_type}, score: {duplicate_score:.2f}).")

        if not reasons:
            reasons.append("All scoring signals agree and are within expected bounds.")

        return {
            "confidence_score": score,
            "confidence_level": level,
            "review_required": review_required,
            "reasons": reasons,
        }

