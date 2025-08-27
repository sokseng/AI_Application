from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate
from app.models.user_model import UserRight
from app.models.user_model import User
from app.schemas.candidate_schema import CandidateCreate, DeleteCandidate
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
    candidates =(
        db.query(
            Candidate.pk_id,
            Candidate.first_name,
            Candidate.last_name,
            Candidate.email,
            Candidate.gender,
            Candidate.phone,
            Candidate.date_of_birth,
            Candidate.address1,
            Candidate.address2,
            Candidate.user_id,
            UserRight.name.label("right_name"),
            UserRight.pk_id.label("right_id")
        )
        .join(User, Candidate.user_id == User.pk_id)
        .join(UserRight, User.right_id == UserRight.pk_id)
        .all()
    )

    # Convert each row to dict
    result = []
    for c in candidates:
        result.append({
            "pk_id": c.pk_id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "gender": c.gender,
            "phone": c.phone,
            "date_of_birth": c.date_of_birth,
            "address1": c.address1,
            "address2": c.address2,
            "user_id": c.user_id,
            "right_id": c.right_id,
            "right_name": c.right_name
        })
    
    return result

#create or update candidate
def create_or_update_candidate(db: Session, candidate: CandidateCreate):
    if candidate.pk_id:
        #check exist email
        existing_email = db.query(User).filter(
            User.email == candidate.email, 
            User.pk_id != candidate.user_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")
        
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
        db_candidate.user_id = db_user.pk_id
        
    else:
        #check exist email
        existing_email = db.query(User).filter(User.email == candidate.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

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
            user_id = db_user.pk_id
        )
        db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


#delete candidate
def delete_candidate(db: Session, data: DeleteCandidate):
    if not data.ids:
        raise HTTPException(status_code=400, detail="No IDs provided for deletion")
    
    candidates = db.query(Candidate).filter(Candidate.pk_id.in_(data.ids)).all()
    if not candidates:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Collect related user IDs
    user_ids = [c.user_id for c in candidates if c.user_id]

    users = []
    if user_ids:
        users = db.query(User).filter(User.pk_id.in_(user_ids)).all()

    # Delete users first (to avoid FK constraint issues)
    for user in users:
        db.delete(user)

    # Delete candidates
    for candidate in candidates:
        db.delete(candidate)

    db.commit()
    
    return {"message": "Candidates and related users deleted successfully"}

