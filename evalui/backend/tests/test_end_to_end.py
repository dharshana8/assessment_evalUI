import pytest
from app.services.evaluation_engine import EvaluationEngine

def test_full_evaluation_flow():
    rubric = [
        {
            "id": "C1",
            "description": "TCP is connection-oriented.",
            "max_marks": 1.0,
            "keywords": ["connection-oriented"]
        }
    ]
    student_text = "TCP is a connection-oriented protocol."
    
    engine = EvaluationEngine()
    result = engine.evaluate_submission(student_text, rubric)

    assert result["total_score"] == 1.0
    assert result["max_score"] == 1.0
    assert result["percentage"] == 100.0
    assert len(result["criteria"]) == 1
    assert result["criteria"][0]["status"] == "ENTAILED"
