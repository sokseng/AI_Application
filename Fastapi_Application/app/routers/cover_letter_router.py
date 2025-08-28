from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.cover_letter_schema import CoverLetterCandidateDropdown, CoverLetterCreate, CoverLetterRead, DeleteCoverLetter
from app.controllers import cover_letter_controller
from app.database.session import SessionLocal
from passlib.context import CryptContext
from app.dependencies.auth import verify_access_token


router = APIRouter(prefix="/cover_letter", tags=["Cover Letter"])
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#get all cover letter
@router.get("/", response_model=list[CoverLetterRead])
def get_all_cover_letter(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    return cover_letter_controller.get_all_cover_letter(db)

#get candidate dropdown
@router.get("/candidate_dropdown", response_model=list[CoverLetterCandidateDropdown])
def get_candidate_dropdown(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    return cover_letter_controller.get_candidate_dropdown(db)

#create or update cover letter
@router.post("/")
def create_or_update_cover_letter(data: CoverLetterCreate, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return cover_letter_controller.create_or_update_cover_letter(db, data)

#delete cover letter
@router.post("/delete")
def delete_cover_letter(data: DeleteCoverLetter, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return cover_letter_controller.delete_cover_letter(db, data)