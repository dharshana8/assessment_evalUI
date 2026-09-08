"""
Unit tests for Local Evaluation Confidence Engine (ConfidenceEngine)
=====================================================================
Tests cover HIGH, MEDIUM, and LOW confidence scenarios, signal disagreement,
contradiction impact, reference reliability impact, duplicate penalties, and configurable thresholds.
"""

import pytest
from app.services.confidence_engine import ConfidenceEngine


def test_confidence_engine_high_confidence():
    """
    Strong agreement across signals + reliable reference + no duplicates
    --> Should yield HIGH confidence (>= 0.75) and review_required = False.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.92,
            "entailment_score": 0.88,
            "lexical_score": 0.90,
            "contradiction_probability": 0.02,
            "keyword_stuffing_detected": False,
            "status": "ENTAILED",
            "awarded_marks": 1.0,
        },
        {
            "criterion_id": "c2",
            "semantic_score": 0.88,
            "entailment_score": 0.84,
            "lexical_score": 0.85,
            "contradiction_probability": 0.03,
            "keyword_stuffing_detected": False,
            "status": "ENTAILED",
            "awarded_marks": 1.0,
        },
    ]

    res = engine.compute(
        evaluated_criteria=evaluated_criteria,
        reliability_score=1.0,
        duplicate_score=0.0,
        duplicate_type="ORIGINAL",
    )

    assert "confidence_score" in res
    assert "confidence_level" in res
    assert "review_required" in res
    assert "reasons" in res

    assert res["confidence_level"] == "HIGH"
    assert res["confidence_score"] >= 0.75
    assert res["review_required"] is False
    assert isinstance(res["reasons"], list)
    assert len(res["reasons"]) > 0


def test_confidence_engine_medium_confidence():
    """
    Moderate agreement / signals (partial match, moderate semantic/entailment)
    --> Should yield MEDIUM confidence (0.50 <= score < 0.75) and review_required = False.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.65,
            "entailment_score": 0.55,
            "lexical_score": 0.50,
            "contradiction_probability": 0.10,
            "keyword_stuffing_detected": False,
            "status": "PARTIAL",
            "awarded_marks": 0.5,
        },
        {
            "criterion_id": "c2",
            "semantic_score": 0.60,
            "entailment_score": 0.50,
            "lexical_score": 0.55,
            "contradiction_probability": 0.12,
            "keyword_stuffing_detected": False,
            "status": "PARTIAL",
            "awarded_marks": 0.5,
        },
    ]

    res = engine.compute(
        evaluated_criteria=evaluated_criteria,
        reliability_score=0.85,
        duplicate_score=0.0,
        duplicate_type="ORIGINAL",
    )

    assert res["confidence_level"] == "MEDIUM"
    assert 0.50 <= res["confidence_score"] < 0.75
    assert res["review_required"] is False


def test_confidence_engine_low_confidence_due_to_contradiction():
    """
    High contradiction probability and weak evidence
    --> Should yield LOW confidence (< 0.50) and review_required = True.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.25,
            "entailment_score": 0.10,
            "lexical_score": 0.20,
            "contradiction_probability": 0.75,
            "keyword_stuffing_detected": False,
            "status": "CONTRADICTION",
            "awarded_marks": 0.0,
        }
    ]

    res = engine.compute(
        evaluated_criteria=evaluated_criteria,
        reliability_score=1.0,
        duplicate_score=0.0,
        duplicate_type="ORIGINAL",
    )

    assert res["confidence_level"] == "LOW"
    assert res["confidence_score"] < 0.50
    assert res["review_required"] is True
    assert any("Contradiction" in r for r in res["reasons"])


def test_confidence_engine_low_confidence_due_to_unreliable_reference():
    """
    Low reference answer reliability score
    --> Should yield LOW confidence and review_required = True.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.70,
            "entailment_score": 0.60,
            "lexical_score": 0.65,
            "contradiction_probability": 0.05,
            "keyword_stuffing_detected": False,
            "status": "ENTAILED",
            "awarded_marks": 1.0,
        }
    ]

    res = engine.compute(
        evaluated_criteria=evaluated_criteria,
        reliability_score=0.30,  # Unreliable reference
        duplicate_score=0.0,
        duplicate_type="ORIGINAL",
    )

    assert res["confidence_level"] == "LOW"
    assert res["confidence_score"] < 0.50
    assert res["review_required"] is True
    assert any("reliability" in r.lower() for r in res["reasons"])


def test_confidence_engine_large_signal_disagreement():
    """
    High disagreement between semantic, entailment, and lexical signals
    --> Should penalize confidence and mention signal disagreement in reasons.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.95,
            "entailment_score": 0.10,
            "lexical_score": 0.10,
            "contradiction_probability": 0.05,
            "keyword_stuffing_detected": False,
            "status": "UNSUPPORTED",
            "awarded_marks": 0.0,
        }
    ]

    res = engine.compute(
        evaluated_criteria=evaluated_criteria,
        reliability_score=1.0,
        duplicate_score=0.0,
        duplicate_type="ORIGINAL",
    )

    assert any("disagreement" in r.lower() for r in res["reasons"])


def test_confidence_engine_duplicate_penalty():
    """
    Near duplicate detection should reduce confidence score and trigger duplicate reason.
    """
    engine = ConfidenceEngine()

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.85,
            "entailment_score": 0.80,
            "lexical_score": 0.80,
            "contradiction_probability": 0.05,
            "keyword_stuffing_detected": False,
            "status": "ENTAILED",
            "awarded_marks": 1.0,
        }
    ]

    res_clean = engine.compute(evaluated_criteria, reliability_score=1.0, duplicate_score=0.0, duplicate_type="ORIGINAL")
    res_dup = engine.compute(evaluated_criteria, reliability_score=1.0, duplicate_score=0.90, duplicate_type="EXACT_COPY")

    assert res_dup["confidence_score"] < res_clean["confidence_score"]
    assert any("duplicate" in r.lower() for r in res_dup["reasons"])


def test_confidence_engine_configurable_thresholds():
    """
    Verify thresholds are configurable.
    """
    strict_engine = ConfidenceEngine(high_threshold=0.95, medium_threshold=0.80)

    evaluated_criteria = [
        {
            "criterion_id": "c1",
            "semantic_score": 0.85,
            "entailment_score": 0.80,
            "lexical_score": 0.80,
            "contradiction_probability": 0.05,
            "keyword_stuffing_detected": False,
            "status": "ENTAILED",
            "awarded_marks": 1.0,
        }
    ]

    res = strict_engine.compute(evaluated_criteria, reliability_score=1.0)
    # Score ~0.83 is below strict high threshold of 0.95, so level should be MEDIUM
    assert res["confidence_level"] in ("MEDIUM", "LOW")
