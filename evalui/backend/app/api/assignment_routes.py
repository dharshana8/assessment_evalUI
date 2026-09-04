import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.db_models import Assignment, RubricCriterion
from app.schemas.assignment import AssignmentCreate, AssignmentResponse

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.post("", response_model=AssignmentResponse)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)):
    assignment = Assignment(
        title=payload.title,
        subject=payload.subject,
        question=payload.question,
        total_marks=payload.total_marks
    )
    db.add(assignment)
    db.flush()

    for idx, crit in enumerate(payload.rubric_criteria):
        keywords_str = json.dumps(crit.keywords) if crit.keywords else "[]"
        db_crit = RubricCriterion(
            assignment_id=assignment.id,
            description=crit.description,
            max_marks=crit.max_marks,
            keywords=keywords_str,
            order=idx
        )
        db.add(db_crit)

    db.commit()
    db.refresh(assignment)
    
    # Format response keywords
    for c in assignment.rubric_criteria:
        try:
            c.keywords = json.loads(c.keywords) if c.keywords else []
        except Exception:
            c.keywords = [k.strip() for k in str(c.keywords).split(",") if k.strip()]

    return assignment

@router.get("", response_model=List[AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    assignments = db.query(Assignment).all()
    for a in assignments:
        for c in a.rubric_criteria:
            try:
                c.keywords = json.loads(c.keywords) if c.keywords else []
            except Exception:
                c.keywords = [k.strip() for k in str(c.keywords).split(",") if k.strip()]
    return assignments

@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: str, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    for c in assignment.rubric_criteria:
        try:
            c.keywords = json.loads(c.keywords) if c.keywords else []
        except Exception:
            c.keywords = [k.strip() for k in str(c.keywords).split(",") if k.strip()]

    return assignment
