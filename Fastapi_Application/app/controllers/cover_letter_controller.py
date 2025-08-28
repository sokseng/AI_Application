from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate
from app.models.cover_letter_model import CoverLetter
from app.models.candidate_model import Candidate
from app.schemas.cover_letter_schema import CoverLetterCreate, DeleteCoverLetter
from passlib.context import CryptContext
from app.config.settings import settings  # secret + algorithm from env/config
from fastapi import HTTPException
from datetime import date


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

#get all cover letter
def get_all_cover_letter(db: Session):
    cover_letter = db.query(
        CoverLetter.pk_id,
        CoverLetter.fk_candidate,
        CoverLetter.content,
        CoverLetter.created_date,
        CoverLetter.updated_date,
        Candidate.first_name,
        Candidate.last_name
    ).join(Candidate, CoverLetter.fk_candidate == Candidate.pk_id).all()
    return cover_letter

#candidate dropdown
def get_candidate_dropdown(db: Session):
    candidate = db.query(Candidate.pk_id, Candidate.first_name, Candidate.last_name).all()
    return [{ "pk_id": c.pk_id, "candidate_name": f"{c.first_name} {c.last_name}" } for c in candidate]

#create or update cover letter
def create_or_update_cover_letter(db: Session, data: CoverLetterCreate):
    if data.pk_id:
        db_cover_letter = db.query(CoverLetter).filter(CoverLetter.pk_id == data.pk_id).first()
        if not db_cover_letter:
            raise HTTPException(status_code=404, detail="Cover letter not found")
        
        db_cover_letter.fk_candidate = data.fk_candidate
        db_cover_letter.content = data.content
        db_cover_letter.updated_date = date.today()
    else:
        db_cover_letter = CoverLetter(
            fk_candidate = data.fk_candidate,
            content = data.content,
            created_date = date.today(),
            updated_date = date.today() 
        )
        
        db.add(db_cover_letter)
    db.commit()
    db.refresh(db_cover_letter)
    return db_cover_letter

#delete cover letter
def delete_cover_letter(db: Session, data: DeleteCoverLetter):
    if not data.ids or len(data.ids) == 0:
        raise HTTPException(status_code=400, detail="No ID provided for deletion")
    
    db_cover_letter = db.query(CoverLetter).filter(CoverLetter.pk_id.in_(data.ids)).all()
    if not db_cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    # Delete all cover letter
    for cover_letter in db_cover_letter:
        db.delete(cover_letter)
    db.commit()
    return {"message": "Cover letter deleted successfully"}