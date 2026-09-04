import pytest
from app.services.scoring_engine import ScoringEngine

def test_hybrid_scoring_calculation():
    raw = ScoringEngine.calculate_hybrid_score(
        semantic_score=1.0,
        entailment_score=1.0,
        lexical_score=1.0
    )
    assert abs(raw - 1.0) < 1e-5

def test_mark_discretization():
    awarded = ScoringEngine.discretize_marks(normalized_score=0.90, max_marks=2.0)
    assert awarded == 2.0

    awarded_partial = ScoringEngine.discretize_marks(normalized_score=0.50, max_marks=2.0)
    assert awarded_partial == 1.0
