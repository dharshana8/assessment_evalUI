import pytest
from app.services.similarity_engine import SimilarityEngine

def test_semantic_similarity():
    sim_engine = SimilarityEngine()
    crit = "TCP is a connection-oriented protocol."
    sents = [
        "TCP is connection-oriented.",
        "Cricket is played between two teams."
    ]
    sims = sim_engine.compute_similarity(crit, sents)
    assert len(sims) == 2
    assert sims[0] > 0.80  # High similarity for semantically close sentence
    assert sims[1] < 0.30  # Low similarity for off-topic sentence
