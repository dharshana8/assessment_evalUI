from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.rubric import RubricCriterionCreate, RubricCriterionResponse

class AssignmentCreate(BaseModel):
    title: str = Field(..., description="Assignment title")
    subject: str = Field(..., description="Subject or course name")
    question: str = Field(..., description="Descriptive question text")
    total_marks: float = Field(..., gt=0, description="Total marks for assignment")
    rubric_criteria: List[RubricCriterionCreate] = Field(..., min_items=1, description="List of atomic rubric criteria")

class AssignmentResponse(BaseModel):
    id: str
    title: str
    subject: str
    question: str
    total_marks: float
    created_at: datetime
    rubric_criteria: List[RubricCriterionResponse]

    class Config:
        from_attributes = True
