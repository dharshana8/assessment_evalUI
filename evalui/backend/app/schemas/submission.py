from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TextSubmissionCreate(BaseModel):
    assignment_id: str = Field(..., description="Target assignment ID")
    student_id: Optional[str] = Field(default="STUDENT_001", description="Student ID or Name")
    content: str = Field(..., min_length=1, description="Student descriptive answer text")

class SubmissionResponse(BaseModel):
    id: str
    assignment_id: str
    student_id: Optional[str]
    input_type: str
    original_filename: Optional[str]
    content: str
    submitted_at: datetime

    class Config:
        from_attributes = True
