import pytest
from app.services.duplicate_engine import DuplicateEngine

@pytest.fixture
def dup_engine():
    return DuplicateEngine()

def test_exact_copied_answer(dup_engine):
    target = "TCP is a connection-oriented transport protocol using a 3-way handshake."
    candidate = "TCP is a connection-oriented transport protocol using a 3-way handshake."
    
    score, dup_type = dup_engine.compare_pair(target, candidate)
    
    assert score == 1.0
    assert dup_type == "EXACT_COPY"

def test_minor_wording_changes(dup_engine):
    target = "TCP is a connection-oriented protocol where the client sends a SYN packet to initiate communication."
    candidate = "TCP is a connection-oriented protocol, where the client transmits a SYN packet to begin communication."
    
    score, dup_type = dup_engine.compare_pair(target, candidate)
    
    assert score >= 0.85
    assert dup_type in ("EXACT_COPY", "NEAR_DUPLICATE")

def test_paraphrased_answer(dup_engine):
    target = "TCP initiates communication by completing a 3-way handshake between client and server before data transfer."
    candidate = "Before transmitting data, TCP establishes a connection using a three-step handshake process between client and server."
    
    score, dup_type = dup_engine.compare_pair(target, candidate)
    
    assert score >= 0.70
    assert dup_type in ("NEAR_DUPLICATE", "POSSIBLE_SIMILARITY")

def test_same_topic_independently_written_answer(dup_engine):
    domain_keywords = ["TCP", "protocol", "connection", "handshake", "packet", "SYN", "ACK"]
    target = "TCP ensures reliable data transfer over IP networks by establishing virtual circuits with SYN and ACK control flags."
    candidate = "The Transmission Control Protocol manages congestion control and flow control mechanisms across wide area networks."
    
    score, dup_type = dup_engine.compare_pair(target, candidate, domain_keywords=domain_keywords)
    
    assert dup_type in ("ORIGINAL", "POSSIBLE_SIMILARITY")
    assert score < 0.85  # Not flagged as a near-duplicate or exact copy

def test_completely_different_answer(dup_engine):
    target = "TCP is a connection-oriented transport protocol using a 3-way handshake."
    candidate = "Cricket is a bat-and-ball game played between two teams of eleven players on a field."
    
    score, dup_type = dup_engine.compare_pair(target, candidate)
    
    assert score < 0.40
    assert dup_type == "ORIGINAL"

def test_check_duplicate_against_candidate_list(dup_engine):
    target = "TCP uses a three-way handshake involving SYN, SYN-ACK, and ACK packets."
    candidates = [
        {"id": "S101", "content": "Cricket is played on a field with two teams."},
        {"id": "S102", "content": "TCP uses a three-way handshake involving SYN, SYN-ACK, and ACK packets."},
        {"id": "S103", "content": "UDP is a connectionless transport protocol."}
    ]

    res = dup_engine.check_duplicate(target, candidates)

    assert res["duplicate_flag"] is True
    assert res["duplicate_type"] == "EXACT_COPY"
    assert res["matched_submission_id"] == "S102"
    assert res["duplicate_score"] == 1.0
