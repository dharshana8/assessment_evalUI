import pytest
from app.services.reliability_engine import ReliabilityEngine

@pytest.fixture
def engine():
    return ReliabilityEngine()

def test_reliable_reference(engine):
    question = "Explain the TCP three-way handshake process."
    reference = (
        "TCP is a connection-oriented transport layer protocol. "
        "The client initiates communication by sending a SYN packet to the server. "
        "The server responds with a SYN-ACK packet. "
        "Finally, the client completes the handshake by sending an ACK packet."
    )
    rubric = [
        {"description": "TCP is a connection-oriented protocol.", "keywords": ["connection-oriented"]},
        {"description": "Client sends SYN to initiate communication.", "keywords": ["SYN"]},
        {"description": "Server responds with SYN-ACK.", "keywords": ["SYN-ACK"]},
        {"description": "Client sends ACK to complete the handshake.", "keywords": ["ACK"]}
    ]

    result = engine.evaluate_reliability(
        reference_answer=reference,
        question=question,
        rubric_criteria=rubric
    )

    assert result["status"] == "RELIABLE"
    assert result["reliability_score"] >= 0.80
    assert result["contradictions_found"] == 0
    assert len(result["issues"]) == 0
    assert result["claims_checked"] > 0

def test_contradictory_reference(engine):
    question = "Explain TCP protocol features."
    reference = (
        "TCP is a connection-oriented protocol. "
        "TCP is not a connection-oriented protocol and it does not use connection establishment."
    )
    rubric = [
        {"description": "TCP is a connection-oriented protocol.", "keywords": ["connection-oriented"]}
    ]

    result = engine.evaluate_reliability(
        reference_answer=reference,
        question=question,
        rubric_criteria=rubric
    )

    assert result["status"] in ("UNRELIABLE", "REVIEW_REQUIRED")
    assert result["contradictions_found"] >= 1
    assert any("contradiction" in issue.lower() for issue in result["issues"])

def test_question_reference_mismatch(engine):
    question = "Describe the cell division process in biology."
    reference = (
        "TCP is a connection-oriented protocol. The client sends a SYN packet and receives SYN-ACK from the server."
    )
    rubric = [
        {"description": "Mitosis divides somatic cells.", "keywords": ["mitosis"]}
    ]

    result = engine.evaluate_reliability(
        reference_answer=reference,
        question=question,
        rubric_criteria=rubric
    )

    assert result["status"] in ("REVIEW_REQUIRED", "UNRELIABLE")
    assert any("alignment" in issue.lower() for issue in result["issues"])

def test_missing_rubric_concepts(engine):
    question = "Explain HTTP status codes."
    reference = (
        "HTTP 200 OK indicates a successful request. HTTP 404 Not Found indicates that the resource is missing."
    )
    rubric = [
        {"description": "HTTP 200 indicates success.", "keywords": ["200", "OK"]},
        {"description": "HTTP 500 Internal Server Error occurs on server failure.", "keywords": ["500", "Internal Server Error"]}
    ]

    result = engine.evaluate_reliability(
        reference_answer=reference,
        question=question,
        rubric_criteria=rubric
    )

    assert result["alignment_score"] < 1.0
    assert any("missing or weakly represented" in issue.lower() for issue in result["issues"])

def test_conflicting_numerical_values(engine):
    question = "What is the standard HTTP port?"
    reference = (
        "The standard unencrypted HTTP web server operates on port 80. "
        "Unlike standard web servers, HTTP operates on port 443 instead of port 80."
    )
    rubric = [
        {"description": "HTTP standard port.", "keywords": ["port", "80"]}
    ]

    result = engine.evaluate_reliability(
        reference_answer=reference,
        question=question,
        rubric_criteria=rubric
    )

    assert result["status"] in ("REVIEW_REQUIRED", "UNRELIABLE")
    assert any("conflicting" in issue.lower() or "contradiction" in issue.lower() for issue in result["issues"])
