from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class OverrideCreate(BaseModel):
    new_score: float = Field(..., ge=0, description="New instructor-adjusted score")
    reason: str = Field(..., min_length=3, description="Reason for score override")
    teacher_id: Optional[str] = Field(default="TEACHER_001")

class EvidenceSchema(BaseModel):
    sentence_id: int
    text: str
    similarity: float
    entailment: float
    contradiction: float
    status: str

class CriterionEvaluationResponse(BaseModel):
    id: str
    criterion_id: str
    description: str
    max_marks: float
    awarded_marks: float
    semantic_score: float
    entailment_score: float
    contradiction_probability: float
    lexical_score: float
    status: str
    evidence: Optional[EvidenceSchema] = None
    missing_concepts: List[str] = Field(default_factory=list)
    keyword_stuffing_detected: bool = False
    feedback: str
    override_score: Optional[float] = None
    override_reason: Optional[str] = None

class EvaluationResponse(BaseModel):
    evaluation_id: str
    submission_id: str
    assignment_id: str
    assignment_title: str
    question: str
    student_id: str
    student_answer: str
    total_score: float
    final_score: float  # Includes overrides if present
    max_score: float
    percentage: float
    processing_time: float
    sentences: List[Dict[str, Any]]
    criteria: List[CriterionEvaluationResponse]
    diagnostic_summary: str
    created_at: datetime

    class Config:
        from_attributes = True
