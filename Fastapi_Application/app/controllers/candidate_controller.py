from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate
from app.models.user_model import User
from app.schemas.user_schema import UserRightCreate
from app.schemas.candidate_schema import CandidateCreate
from passlib.context import CryptContext
from app.config.settings import settings  # secret + algorithm from env/config
from fastapi import HTTPException
from enum import Enum


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

class UserRoleEnum(int, Enum):
    admin = 1
    candidate = 2

#get all candidate
def get_all_candidate(db: Session):
    candidate = db.query(Candidate).all()
    return candidate

#create or update candidate
def create_or_update_candidate(db: Session, candidate: CandidateCreate):
    if candidate.pk_id:
        #update candidate
        db_candidate = db.query(Candidate).filter(Candidate.pk_id == candidate.pk_id).first()
        if not db_candidate:   
            raise HTTPException(status_code=404, detail="Candidate not found")
        db_candidate.first_name = candidate.first_name
        db_candidate.last_name = candidate.last_name
        db_candidate.email = candidate.email
        db_candidate.gender = candidate.gender
        db_candidate.phone = candidate.phone
        db_candidate.date_of_birth = candidate.date_of_birth
        db_candidate.address1 = candidate.address1
        db_candidate.address2 = candidate.address2
        db_candidate.user_id = candidate.user_id

        #update user
        db_user = db.query(User).filter(User.pk_id == candidate.user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        db_user.name = f"{candidate.first_name} {candidate.last_name}"
        db_user.email = candidate.email
        db_user.right_id = candidate.right_id
        db_user.role_id = UserRoleEnum.candidate.value
        
        db.commit()
        db.refresh(db_user)
    else:

        #create user
        db_user = User(
            name=f"{candidate.first_name} {candidate.last_name}",
            email = candidate.email,
            password = bcrypt_context.hash(candidate.password),
            role_id = UserRoleEnum.candidate.value,
            right_id = candidate.right_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        #create candidate
        db_candidate = Candidate(
            first_name = candidate.first_name,
            last_name = candidate.last_name,
            email = candidate.email,
            gender = candidate.gender,
            phone = candidate.phone,
            date_of_birth = candidate.date_of_birth,
            address1 = candidate.address1,
            address2 = candidate.address2,
            user_id = candidate.user_id
        )
        db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate
