import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(20), nullable=False, default="INSTRUCTOR")  # INSTRUCTOR or STUDENT
    created_at = Column(DateTime, default=datetime.utcnow)

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=False)
    question = Column(Text, nullable=False)
    reference_answer = Column(Text, nullable=True)
    total_marks = Column(Float, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    rubric_criteria = relationship("RubricCriterion", back_populates="assignment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")

class RubricCriterion(Base):
    __tablename__ = "rubric_criteria"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assignment_id = Column(String(36), ForeignKey("assignments.id"), nullable=False)
    description = Column(Text, nullable=False)
    max_marks = Column(Float, nullable=False)
    keywords = Column(Text, nullable=True)  # Comma-separated or JSON list
    order = Column(Integer, default=0)

    assignment = relationship("Assignment", back_populates="rubric_criteria")
    criterion_evaluations = relationship("CriterionEvaluation", back_populates="rubric_criterion", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assignment_id = Column(String(36), ForeignKey("assignments.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    input_type = Column(String(20), nullable=False)  # TEXT or PDF
    original_filename = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("Assignment", back_populates="submissions")
    evaluations = relationship("Evaluation", back_populates="submission", cascade="all, delete-orphan")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    total_score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    processing_time = Column(Float, nullable=False)
    diagnostic_summary = Column(Text, nullable=True)
    reliability_score = Column(Float, nullable=True, default=1.0)
    reliability_status = Column(String(50), nullable=True, default="RELIABLE")
    reliability_issues = Column(Text, nullable=True)
    duplicate_flag = Column(Boolean, default=False)
    duplicate_type = Column(String(50), nullable=True, default="ORIGINAL")
    duplicate_score = Column(Float, nullable=True, default=0.0)
    matched_submission_id = Column(String(36), nullable=True)
    confidence_score = Column(Float, nullable=True, default=1.0)
    confidence_level = Column(String(20), nullable=True, default="HIGH")
    review_required = Column(Boolean, default=False)
    confidence_reasons = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="evaluations")
    criterion_evaluations = relationship("CriterionEvaluation", back_populates="evaluation", cascade="all, delete-orphan")

class CriterionEvaluation(Base):
    __tablename__ = "criterion_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluations.id"), nullable=False)
    criterion_id = Column(String(36), ForeignKey("rubric_criteria.id"), nullable=False)
    awarded_marks = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    entailment_score = Column(Float, nullable=False)
    contradiction_probability = Column(Float, nullable=False)
    lexical_score = Column(Float, nullable=False)
    status = Column(String(30), nullable=False)
    evidence_sentence_id = Column(Integer, nullable=True)
    evidence_text = Column(Text, nullable=True)
    keyword_stuffing_detected = Column(Boolean, default=False)
    feedback = Column(Text, nullable=False)

    evaluation = relationship("Evaluation", back_populates="criterion_evaluations")
    rubric_criterion = relationship("RubricCriterion", back_populates="criterion_evaluations")
    teacher_overrides = relationship("TeacherOverride", back_populates="criterion_evaluation", cascade="all, delete-orphan")

class TeacherOverride(Base):
    __tablename__ = "teacher_overrides"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    criterion_evaluation_id = Column(String(36), ForeignKey("criterion_evaluations.id"), nullable=False)
    original_score = Column(Float, nullable=False)
    new_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    criterion_evaluation = relationship("CriterionEvaluation", back_populates="teacher_overrides")
