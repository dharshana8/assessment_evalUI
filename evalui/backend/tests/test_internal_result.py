"""
Unit tests for Clean Internal Evaluation Result Structure
==========================================================
Verifies that build_internal_evaluation_result produces the exact internal schema required by EvalUI.
"""

import pytest
from app.schemas.evaluation import build_internal_evaluation_result
from app.services.evaluation_engine import EvaluationEngine


def test_internal_evaluation_result_structure():
    raw_eval = {
        "total_score": 7.0,
        "max_score": 10.0,
        "reliability": {
            "score": 0.92,
            "status": "RELIABLE",
            "issues": []
        },
        "criteria": [
            {
                "criterion_id": "C1",
                "max_marks": 2.0,
                "awarded_marks": 1.5,
                "status": "PARTIAL",
                "semantic_score": 0.81,
                "lexical_score": 0.75,
                "evidence": {
                    "text": "Plants use chlorophyll to absorb sunlight.",
                    "similarity": 0.88
                },
                "missing_concepts": [],
                "contradiction_probability": 0.05,
                "feedback": "Chlorophyll role identified."
            }
        ],
        "confidence": {
            "confidence_score": 0.86,
            "confidence_level": "HIGH",
            "review_required": False
        }
    }

    duplicate_info = {
        "duplicate_flag": False,
        "duplicate_type": "ORIGINAL",
        "duplicate_score": 0.08
    }

    res = build_internal_evaluation_result(raw_eval, duplicate_info)

    # Top-level keys
    assert res["score"] == 7.0
    assert res["max_score"] == 10.0

    # Reliability
    assert res["reliability"]["score"] == 0.92
    assert res["reliability"]["status"] == "RELIABLE"
    assert res["reliability"]["issues"] == []

    # Duplicate
    assert res["duplicate"]["flag"] is False
    assert res["duplicate"]["type"] == "ORIGINAL"
    assert res["duplicate"]["score"] == 0.08

    # Confidence
    assert res["confidence"]["score"] == 0.86
    assert res["confidence"]["level"] == "HIGH"
    assert res["confidence"]["review_required"] is False

    # Criteria
    assert len(res["criteria"]) == 1
    crit = res["criteria"][0]
    assert crit["criterion_id"] == "C1"
    assert crit["max_marks"] == 2.0
    assert crit["awarded_marks"] == 1.5
    assert crit["status"] == "PARTIAL"
    assert crit["semantic_score"] == 0.81
    assert crit["concept_coverage"] == 0.75
    assert len(crit["evidence"]) == 1
    assert crit["evidence"][0]["sentence"] == "Plants use chlorophyll to absorb sunlight."
    assert crit["evidence"][0]["support"] == 0.88
    assert crit["missing_concepts"] == []
    assert crit["contradiction"] is False
    assert crit["feedback"] == "Chlorophyll role identified."


def test_internal_evaluation_result_integration_in_engine():
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "C1",
            "description": "TCP is connection-oriented.",
            "max_marks": 2.0,
            "keywords": ["connection-oriented"]
        }
    ]
    student_answer = "TCP is a connection-oriented protocol."

    eval_res = engine.evaluate_submission(student_answer, rubric)

    assert "internal_result" in eval_res
    internal = eval_res["internal_result"]

    assert "score" in internal
    assert "max_score" in internal
    assert "reliability" in internal
    assert "criteria" in internal
    assert "duplicate" in internal
    assert "confidence" in internal

    assert isinstance(internal["criteria"], list)
    assert len(internal["criteria"]) == 1
    assert "concept_coverage" in internal["criteria"][0]
    assert "evidence" in internal["criteria"][0]
