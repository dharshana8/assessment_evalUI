import pytest
from app.services.nli_engine import NLIEngine

def test_nli_entailment_and_contradiction():
    nli = NLIEngine()
    hypothesis = "TCP is a connection-oriented protocol."
    
    premise_entail = "TCP is connection-oriented."
    res_entail = nli.evaluate_pair(premise=premise_entail, hypothesis=hypothesis)
    assert res_entail["entailment"] > 0.50

    premise_contra = "TCP is not a connection-oriented protocol."
    res_contra = nli.evaluate_pair(premise=premise_contra, hypothesis=hypothesis)
    assert res_contra["contradiction"] > 0.80
