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


def test_feedback_for_correct_answer():
    """
    Correct / Entailed Answer test case:
    Should reference supporting evidence, produce actionable improvement suggestion, and contain no contradiction.
    """
    res = FeedbackEngine.generate_criterion_feedback_data(
        status="ENTAILED",
        criterion_desc="Explain the role of chlorophyll",
        missing_keywords=[],
        keyword_stuffing=False,
        evidence_text="Plants use chlorophyll to absorb sunlight.",
        awarded_marks=2.0,
        max_marks=2.0
    )

    assert res["criterion_name"] == "Explain the role of chlorophyll"
    assert res["max_marks"] == 2.0
    assert res["awarded_marks"] == 2.0
    assert res["status"] == "ENTAILED"
    assert res["supporting_evidence"] == "Plants use chlorophyll to absorb sunlight."
    assert res["missing_concepts"] == []
    assert res["contradiction"] is None
    assert isinstance(res["improvement_suggestion"], str)
    assert "Plants use chlorophyll to absorb sunlight." in res["feedback"]


def test_feedback_for_partial_answer():
    """
    Partial Answer test case:
    Example from prompt:
      Criterion: "Explain the role of chlorophyll"
      Score: 1.0 / 2.0
      Evidence: "Plants use chlorophyll to absorb sunlight."
      Missing concept: ["photosynthesis"]
    Should identify what was found, what is missing, and provide an actionable suggestion.
    """
    res = FeedbackEngine.generate_criterion_feedback_data(
        status="PARTIAL",
        criterion_desc="Explain the role of chlorophyll",
        missing_keywords=["photosynthesis"],
        keyword_stuffing=False,
        evidence_text="Plants use chlorophyll to absorb sunlight.",
        awarded_marks=1.0,
        max_marks=2.0
    )

    assert res["criterion_name"] == "Explain the role of chlorophyll"
    assert res["max_marks"] == 2.0
    assert res["awarded_marks"] == 1.0
    assert res["status"] == "PARTIAL"
    assert res["supporting_evidence"] == "Plants use chlorophyll to absorb sunlight."
    assert res["missing_concepts"] == ["photosynthesis"]
    assert "photosynthesis" in res["improvement_suggestion"]
    assert "Plants use chlorophyll to absorb sunlight." in res["feedback"]
    assert "photosynthesis" in res["feedback"]


def test_feedback_for_contradicted_answer():
    """
    Contradicted Answer test case:
    Should highlight direct contradiction, detail the conflict, and suggest correction.
    """
    res = FeedbackEngine.generate_criterion_feedback_data(
        status="CONTRADICTED",
        criterion_desc="TCP is connection-oriented",
        missing_keywords=["connection-oriented"],
        keyword_stuffing=False,
        evidence_text="TCP is a connectionless protocol that does not establish sessions.",
        contradiction_prob=0.88,
        awarded_marks=0.0,
        max_marks=1.0
    )

    assert res["criterion_name"] == "TCP is connection-oriented"
    assert res["status"] == "CONTRADICTED"
    assert res["supporting_evidence"] == "TCP is a connectionless protocol that does not establish sessions."
    assert res["contradiction"] is not None
    assert "contradiction" in res["contradiction"].lower()
    assert "connectionless protocol" in res["feedback"]
    assert "Suggestion:" in res["feedback"]
