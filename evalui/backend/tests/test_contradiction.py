import pytest
from app.services.scoring_engine import ScoringEngine

def test_contradiction_guardrail_trigger():
    res = ScoringEngine.evaluate_criterion(
        semantic_score=0.95,
        entailment_score=0.01,
        contradiction_prob=0.92,  # > 0.60 threshold
        lexical_score=1.0,
        max_marks=1.0
    )
    assert res["status"] == "CONTRADICTED"
    assert res["awarded_marks"] == 0.0
    assert res["guardrail_triggered"] is True
