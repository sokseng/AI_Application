from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate
from app.schemas.user_schema import UserRightCreate
from passlib.context import CryptContext
from app.config.settings import settings  # secret + algorithm from env/config
from fastapi import HTTPException


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')


def get_all_candidate(db: Session):
    candidate = db.query(Candidate).all()
    return candidate