"""
Comprehensive Unit Tests for Rubric Scoring Implementation (ScoringEngine & EvaluationEngine)
================================================================================================
Verifies true criterion-level partial credit, hybrid scoring formula, contradiction guardrails,
total score ceiling safety, and explicit scoring reasons across all evaluation cases.
"""

import pytest
from app.services.scoring_engine import ScoringEngine
from app.services.evaluation_engine import EvaluationEngine


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


def test_contradiction_guardrail_zero_marks():
    """
    Ensure contradictory evidence cannot accidentally receive full marks even if semantic similarity is high.
    """
    res = ScoringEngine.evaluate_criterion(
        semantic_score=0.85,
        entailment_score=0.10,
        contradiction_prob=0.80,  # High contradiction
        lexical_score=0.90,
        max_marks=2.0
    )

    assert res["awarded_marks"] == 0.0
    assert res["status"] == "CONTRADICTED"
    assert res["guardrail_triggered"] is True
    assert "Contradiction guardrail triggered" in res["scoring_reason"]


def test_scoring_full_correct_answer():
    """
    Full correct answer should earn full marks (100% of max).
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "TCP is a connection-oriented protocol.",
            "max_marks": 2.0,
            "keywords": ["connection-oriented", "protocol"]
        }
    ]
    student_answer = "TCP is a connection-oriented protocol that establishes a connection before transmitting data."

    res = engine.evaluate_submission(student_answer, rubric)

    assert res["total_score"] == 2.0
    assert res["max_score"] == 2.0
    assert res["criteria"][0]["status"] == "ENTAILED"
    assert res["criteria"][0]["awarded_marks"] == 2.0
    assert "scoring_reason" in res["criteria"][0]


def test_scoring_partial_answer():
    """
    Partial answer should receive partial credit (e.g. 50% or 75% band).
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "Client sends SYN, server responds with SYN-ACK, and client sends ACK.",
            "max_marks": 2.0,
            "keywords": ["SYN", "SYN-ACK", "ACK"]
        }
    ]
    student_answer = "The client sends a SYN packet to initiate communication."

    res = engine.evaluate_submission(student_answer, rubric)

    assert 0.0 <= res["total_score"] <= 2.0
    assert "scoring_reason" in res["criteria"][0]


def test_scoring_paraphrased_answer():
    """
    Paraphrased answer using different vocabulary should earn substantial credit via semantic + NLI signals.
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "Photosynthesis converts solar energy into chemical energy stored in glucose.",
            "max_marks": 2.0,
            "keywords": ["photosynthesis", "solar energy", "glucose"]
        }
    ]
    student_answer = "Plants transform sunlight into stored chemical power inside sugar molecules during photosynthesis."

    res = engine.evaluate_submission(student_answer, rubric)

    assert res["total_score"] > 0.0
    assert res["criteria"][0]["evidence_strength"] > 0.30


def test_scoring_irrelevant_answer():
    """
    Irrelevant/off-topic answer should receive 0 marks.
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "TCP is a connection-oriented protocol.",
            "max_marks": 2.0,
            "keywords": ["connection-oriented"]
        }
    ]
    student_answer = "Football is a popular sport played with two teams of eleven players."

    res = engine.evaluate_submission(student_answer, rubric)

    assert res["total_score"] == 0.0
    assert res["criteria"][0]["awarded_marks"] == 0.0
    assert res["criteria"][0]["status"] in ("UNSUPPORTED", "CONTRADICTED")


def test_scoring_contradicted_answer():
    """
    Contradicted answer must be assigned 0 marks and CONTRADICTED status.
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "TCP is a connection-oriented protocol.",
            "max_marks": 2.0,
            "keywords": ["connection-oriented"]
        }
    ]
    student_answer = "TCP is not a connection-oriented protocol and never establishes connections."

    res = engine.evaluate_submission(student_answer, rubric)

    assert res["total_score"] == 0.0
    assert res["criteria"][0]["awarded_marks"] == 0.0
    assert res["criteria"][0]["status"] == "CONTRADICTED"


def test_scoring_keyword_stuffing():
    """
    Keyword stuffing (high keywords, no semantic context) should be flagged and prevented from receiving full credit.
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "TCP three-way handshake uses SYN, SYN-ACK, and ACK packets to establish reliable sessions.",
            "max_marks": 2.0,
            "keywords": ["SYN", "SYN-ACK", "ACK", "handshake"]
        }
    ]
    student_answer = "SYN SYN-ACK ACK handshake SYN SYN-ACK ACK."

    res = engine.evaluate_submission(student_answer, rubric)

    assert res["criteria"][0]["keyword_stuffing_detected"] is True
    assert res["total_score"] < 2.0


def test_scoring_multiple_rubric_criteria_and_max_ceiling():
    """
    Multiple rubric criteria evaluation: Total awarded score can NEVER exceed total max score.
    """
    engine = EvaluationEngine()
    rubric = [
        {
            "id": "c1",
            "description": "TCP is connection-oriented.",
            "max_marks": 1.5,
            "keywords": ["connection-oriented"]
        },
        {
            "id": "c2",
            "description": "Client sends SYN packet.",
            "max_marks": 1.5,
            "keywords": ["SYN"]
        },
        {
            "id": "c3",
            "description": "Server responds with SYN-ACK.",
            "max_marks": 1.0,
            "keywords": ["SYN-ACK"]
        }
    ]
    student_answer = (
        "TCP is a connection-oriented protocol. The client initiates communication by sending a SYN packet. "
        "The server replies with a SYN-ACK packet."
    )

    res = engine.evaluate_submission(student_answer, rubric)

    assert 0.0 < res["total_score"] <= res["max_score"]
    assert res["max_score"] == 4.0
    assert len(res["criteria"]) == 3
    for c in res["criteria"]:
        assert c["awarded_marks"] <= c["max_marks"]
        assert "scoring_reason" in c


def test_tcp_three_way_handshake_regression():
    """
    Regression Test: Correct, grammatically sound TCP 3-way handshake explanation must earn 100% full credit (8/8)
    and must NOT be classified as keyword stuffing.
    """
    engine = EvaluationEngine()
    rubric = [
        {"id": "c1", "description": "Client sends SYN packet", "max_marks": 2.0, "keywords": ["client", "SYN", "packet"]},
        {"id": "c2", "description": "Server responds with SYN-ACK packet", "max_marks": 2.0, "keywords": ["server", "SYN-ACK"]},
        {"id": "c3", "description": "Client sends ACK packet", "max_marks": 2.0, "keywords": ["client", "ACK"]},
        {"id": "c4", "description": "Connection established and data transfer begins", "max_marks": 2.0, "keywords": ["connection", "established", "data"]}
    ]

    answer = (
        "The TCP three-way handshake is used to establish a reliable connection between a client and a server. "
        "First, the client sends a SYN packet to request a connection. "
        "The server responds with a SYN-ACK packet to acknowledge the request and synchronize its sequence number. "
        "Finally, the client sends an ACK packet to acknowledge the server. "
        "After these three steps, the TCP connection is established and data transmission can begin."
    )

    res = engine.evaluate_submission(answer, rubric)

    assert res["total_score"] == 8.0
    assert res["max_score"] == 8.0
    assert res["percentage"] == 100.0
    for crit in res["criteria"]:
        assert crit["status"] == "ENTAILED"
        assert crit["awarded_marks"] == crit["max_marks"]
        assert crit["keyword_stuffing_detected"] is False


def test_genuine_keyword_stuffing_detected():
    """
    Verify that an unnatural list of keywords without grammatical structure or semantic support is flagged as keyword stuffing.
    """
    engine = EvaluationEngine()
    rubric = [
        {"id": "c1", "description": "Detailed explanation of client sending SYN packet for session request.", "max_marks": 2.0, "keywords": ["client", "SYN", "packet"]}
    ]

    stuffed_answer = "SYN SYN packet client packet SYN client SYN."

    res = engine.evaluate_submission(stuffed_answer, rubric)

    assert res["criteria"][0]["keyword_stuffing_detected"] is True
    assert res["criteria"][0]["awarded_marks"] == 0.0


def test_contradicted_answer_zero_marks():
    """
    Verify that a direct factual contradiction (e.g. UDP is connection-oriented or TCP is connectionless) receives 0 marks.
    """
    engine = EvaluationEngine()
    rubric = [
        {"id": "c1", "description": "TCP is a connection-oriented protocol.", "max_marks": 2.0, "keywords": ["connection-oriented"]}
    ]

    contradicted_answer = "TCP is a connectionless protocol that never establishes a connection."

    res = engine.evaluate_submission(contradicted_answer, rubric)

    assert res["criteria"][0]["status"] == "CONTRADICTED"
    assert res["criteria"][0]["awarded_marks"] == 0.0


def test_partially_incomplete_answer_partial_credit():
    """
    Verify that an answer covering only part of a requirement receives partial credit.
    """
    engine = EvaluationEngine()
    rubric = [
        {"id": "c1", "description": "Client sends SYN packet to request connection.", "max_marks": 2.0, "keywords": ["client", "SYN", "packet"]}
    ]

    partial_answer = "The client sends a message to the server."

    res = engine.evaluate_submission(partial_answer, rubric)

    assert res["criteria"][0]["status"] in ["PARTIAL", "UNSUPPORTED"]
    assert 0.0 < res["criteria"][0]["awarded_marks"] < 2.0
