from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.schemas.candidate_schema import CandidateRead, CandidateCreate, DeleteCandidate
from app.controllers import candidate_controller
from app.database.session import SessionLocal
from passlib.context import CryptContext
from app.dependencies.auth import verify_access_token
import json


router = APIRouter(prefix="/candidate", tags=["Candidate"])
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#get all candidate
@router.get("/", response_model=list[CandidateRead])
def get_all_candidate(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    return candidate_controller.get_all_candidate(db)

#create or update candidate
@router.post("/")
def create_or_update_candidate(candidate: CandidateCreate, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return candidate_controller.create_or_update_candidate(db, candidate)


#delete candidate
@router.post("/delete")
def delete_candidate(data: DeleteCandidate, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return candidate_controller.delete_candidate(db, data)
