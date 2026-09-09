from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.db_models import User
from typing import Optional
import re

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str = Field(..., description="Institutional Email Address")
    password: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str = Field(..., description="Full Name")
    email: str = Field(..., description="Institutional Email Address")
    password: Optional[str] = None
    role: Optional[str] = Field("STAFF", description="STAFF | STUDENT | ORG_ADMIN")
    department: Optional[str] = "CSBS"
    batch: Optional[str] = None
    organization_name: Optional[str] = None

class UserAuthResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    organization_id: str
    organization_name: str
    organization_code: str
    department: Optional[str] = None
    batch: Optional[str] = None

def parse_identity_from_email(
    email: str, 
    name_fallback: str = "",
    role_override: Optional[str] = None,
    dept_override: Optional[str] = None,
    batch_override: Optional[str] = None,
    org_override: Optional[str] = None
):
    clean = email.strip().lower()
    domain = clean.split("@")[1] if "@" in clean else "sece.ac.in"
    org_code = domain.split(".")[0].upper()
    org_name = org_override or ("Sri Eshwar College of Engineering" if org_code == "SECE" else f"{org_code} Institution")
    
    local = clean.split("@")[0] if "@" in clean else clean

    if role_override:
        role = role_override
        user_name = name_fallback or local.replace(".", " ").title()
        dept = dept_override or "CSBS"
        batch = batch_override if role == "STUDENT" else None
    elif "admin" in local:
        role = "ORG_ADMIN"
        dept = "ADMIN"
        batch = None
        user_name = name_fallback or "Organization Admin"
    elif ".s" in local and any(char.isdigit() for char in local):
        role = "STUDENT"
        user_name = name_fallback or local.split(".s")[0].replace(".", " ").title()
        m = re.search(r'\.s(\d{4})([a-z]+)', local)
        if m:
            batch = m.group(1)
            dept = m.group(2).upper()
        else:
            batch = "2024"
            dept = "CSBS"
    else:
        role = "STAFF"
        user_name = name_fallback or ("Dr. " + local.split(".")[0].replace(".", " ").title())
        dept = "CSBS"
        batch = None

    if dept_override:
        dept = dept_override
    if batch_override and role == "STUDENT":
        batch = batch_override

    return {
        "name": user_name,
        "email": clean,
        "role": role,
        "organization_id": f"org_{org_code.lower()}",
        "organization_name": org_name,
        "organization_code": org_code,
        "department": dept,
        "batch": batch
    }

@router.post("/login", response_model=UserAuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Please enter a valid institutional email address.")

    parsed = parse_identity_from_email(
        email=payload.email,
        role_override=payload.role,
        dept_override=payload.department,
        batch_override=payload.batch
    )
    
    user = db.query(User).filter(User.email == parsed["email"]).first()
    if not user:
        user = User(
            name=parsed["name"],
            email=parsed["email"],
            role=parsed["role"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserAuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=parsed["role"],
        organization_id=parsed["organization_id"],
        organization_name=parsed["organization_name"],
        organization_code=parsed["organization_code"],
        department=parsed["department"],
        batch=parsed["batch"]
    )

@router.post("/register", response_model=UserAuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Please enter a valid institutional email address.")

    parsed = parse_identity_from_email(
        email=payload.email,
        name_fallback=payload.name,
        role_override=payload.role,
        dept_override=payload.department,
        batch_override=payload.batch,
        org_override=payload.organization_name
    )
    
    existing = db.query(User).filter(User.email == parsed["email"]).first()
    if existing:
        user = existing
        user.name = payload.name or user.name
        user.role = parsed["role"]
        db.commit()
    else:
        user = User(
            name=payload.name or parsed["name"],
            email=parsed["email"],
            role=parsed["role"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserAuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=parsed["role"],
        organization_id=parsed["organization_id"],
        organization_name=parsed["organization_name"],
        organization_code=parsed["organization_code"],
        department=parsed["department"],
        batch=parsed["batch"]
    )

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    res = []
    for u in users:
        parsed = parse_identity_from_email(u.email, name_fallback=u.name, role_override=u.role)
        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "department": parsed["department"],
            "batch": parsed["batch"],
            "organization_name": parsed["organization_name"],
            "organization_code": parsed["organization_code"],
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return res

