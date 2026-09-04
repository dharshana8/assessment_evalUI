from pydantic import BaseModel, Field
from typing import List, Optional

class RubricCriterionCreate(BaseModel):
    description: str = Field(..., description="Atomic rubric criterion description")
    max_marks: float = Field(..., gt=0, description="Maximum marks for this criterion")
    keywords: List[str] = Field(default_factory=list, description="Mandatory concepts/keywords")
    order: Optional[int] = 0

class RubricCriterionResponse(RubricCriterionCreate):
    id: str
    assignment_id: str

    class Config:
        from_attributes = True
