import pytest
from app.services.evaluation_engine import EvaluationEngine

@pytest.fixture
def engine():
    return EvaluationEngine()

def test_pipeline_with_reliable_reference(engine):
    question = "Explain the TCP three-way handshake."
    student_text = "TCP is connection-oriented. The client sends SYN. The server responds with SYN-ACK. Client sends ACK."
    rubric = [
        {"id": "C1", "description": "TCP is connection-oriented.", "max_marks": 1.0, "keywords": ["connection-oriented"]},
        {"id": "C2", "description": "Client sends SYN.", "max_marks": 1.0, "keywords": ["SYN"]},
        {"id": "C3", "description": "Server responds with SYN-ACK.", "max_marks": 1.0, "keywords": ["SYN-ACK"]},
        {"id": "C4", "description": "Client sends ACK.", "max_marks": 1.0, "keywords": ["ACK"]}
    ]

    result = engine.evaluate_submission(
        student_text=student_text,
        rubric_criteria=rubric,
        question=question
    )

    assert "reliability" in result
    assert result["reliability"]["status"] == "RELIABLE"
    assert result["total_score"] > 0.0
    assert result["criteria"][0]["status"] in ("ENTAILED", "PARTIAL")

def test_pipeline_with_unreliable_reference(engine):
    question = "Explain TCP protocol."
    student_text = "TCP is a reliable transport protocol."
    # Rubric containing direct factual contradiction
    contradictory_reference = (
        "TCP is a connection-oriented protocol. "
        "TCP is not a connection-oriented protocol and it does not use connection establishment."
    )
    rubric = [
        {"id": "C1", "description": "TCP connection-oriented protocol.", "max_marks": 1.0}
    ]

    result = engine.evaluate_submission(
        student_text=student_text,
        rubric_criteria=rubric,
        question=question,
        reference_answer=contradictory_reference
    )

    assert "reliability" in result
    assert result["reliability"]["status"] == "REFERENCE_REVIEW_REQUIRED"
    assert result["total_score"] == 0.0
    assert "REFERENCE_REVIEW_REQUIRED" in result["diagnostic_summary"]
    assert result["criteria"][0]["status"] == "REFERENCE_REVIEW_REQUIRED"
