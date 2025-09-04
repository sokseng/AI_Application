from sqlalchemy.orm import Session
from app.models.candidate_model import Candidate
from app.models.user_model import UserRight
from app.models.user_model import User
from app.schemas.candidate_schema import CandidateCreate, DeleteCandidate
from app.models.global_setting_model import GlobalSetting
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

#get in global setting
def get_password_settings(db: Session):
    codes = [
        "MINIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD",
        "MAXIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD",
        "PASSWORD_SET_LIST_SPECIAL_CHARACTERS",
        "AT_LEAST_ONE_NUMBER_REQUIRED_IN_PASSWORD",
        "AT_LEAST_ONE_UPPERCASE_CHARACTER_REQUIRED_IN_PASSWORD",
        "AT_LEAST_ONE_LOWERCASE_CHARACTER_REQUIRED_IN_PASSWORD",
    ]

    settings = (
        db.query(GlobalSetting)
        .filter(GlobalSetting.code.in_(codes))
        .all()
    )

    result = {}
    for s in settings:
        if s.type == "Number":
            # Convert to int if value exists, else None
            if s.value and s.value.strip().isdigit():
                result[s.code] = int(s.value.strip())
            else:
                result[s.code] = None

        elif s.type == "Boolean":
            if s.value is None:
                result[s.code] = False
            else:
                val = s.value.strip().lower()
                result[s.code] = val in ("true", "1", "yes")

        else:
            # Store stripped string if exists, else empty string
            result[s.code] = s.value.strip() if s.value else ""

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

        # Get password condition in global settings
        settings = get_password_settings(db)
        min_len = settings["MINIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD"]  # int
        max_len = settings["MAXIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD"]  # int
        special_chars = settings["PASSWORD_SET_LIST_SPECIAL_CHARACTERS"] # str
        require_number = settings["AT_LEAST_ONE_NUMBER_REQUIRED_IN_PASSWORD"]       # bool
        require_upper = settings["AT_LEAST_ONE_UPPERCASE_CHARACTER_REQUIRED_IN_PASSWORD"]  # bool
        require_lower = settings["AT_LEAST_ONE_LOWERCASE_CHARACTER_REQUIRED_IN_PASSWORD"]  # bool

        passwords = candidate.password

        # Only validate if setting is not empty
        if min_len is not None and len(passwords) < min_len:
            raise HTTPException(status_code=400,detail="password is too short")
        
        if max_len is not None and len(passwords) > max_len:
            raise HTTPException(status_code=400, detail="password is too long")
        
        if special_chars and not any(char in special_chars for char in passwords):
            raise HTTPException(status_code=400,detail="password special character")
        
        if require_number and not any(char.isdigit() for char in passwords):
            raise HTTPException(status_code=400, detail="Password must contain at least one number")

        if require_upper and not any(char.isupper() for char in passwords):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")

        if require_lower and not any(char.islower() for char in passwords):
            raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
        
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

