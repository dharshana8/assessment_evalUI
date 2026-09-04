import pytest
from app.services.feedback_engine import FeedbackEngine

def test_keyword_stuffing_detection():
    # High lexical (1.0), low semantic (0.20), low entailment (0.10)
    is_stuffing = FeedbackEngine.detect_keyword_stuffing(
        lexical_score=1.0,
        semantic_score=0.20,
        entailment_score=0.10
    )
    assert is_stuffing is True

def test_no_keyword_stuffing_for_genuine_answer():
    is_stuffing = FeedbackEngine.detect_keyword_stuffing(
        lexical_score=1.0,
        semantic_score=0.90,
        entailment_score=0.95
    )
    assert is_stuffing is False
