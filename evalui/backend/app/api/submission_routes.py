from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.db_models import Submission, Assignment
from app.schemas.submission import TextSubmissionCreate, SubmissionResponse
from app.services.parser_service import ParserService

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("/text", response_model=SubmissionResponse)
def submit_text(payload: TextSubmissionCreate, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == payload.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submission = Submission(
        assignment_id=payload.assignment_id,
        student_id=payload.student_id or "STUDENT_001",
        input_type="TEXT",
        original_filename=None,
        content=payload.content.strip()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/pdf", response_model=SubmissionResponse)
async def submit_pdf(
    assignment_id: str = Form(...),
    student_id: str = Form("STUDENT_001"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty")

    extracted_text, is_scanned = ParserService.extract_text_from_pdf_bytes(pdf_bytes)

    if is_scanned:
        raise HTTPException(
            status_code=400,
            detail="PDF contains no extractable text (it may be scanned or empty)."
        )

    submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        input_type="PDF",
        original_filename=file.filename,
        content=extracted_text
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

from typing import List, Optional

@router.get("", response_model=List[SubmissionResponse])
def list_submissions(
    assignment_id: Optional[str] = None,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):

    query = db.query(Submission)
    if assignment_id:
        query = query.filter(Submission.assignment_id == assignment_id)
    if student_id:
        query = query.filter(Submission.student_id == student_id)
    return query.order_by(Submission.submitted_at.desc()).all()

