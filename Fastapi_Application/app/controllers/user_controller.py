
from sqlalchemy.orm import Session
from app.models.user_model import User, UserSession, UserRole, UserRight
from app.schemas.user_schema import DeleteUser
from passlib.context import CryptContext
from jose import jwt
from datetime import timedelta, datetime, timezone
from app.config.settings import settings  # secret + algorithm from env/config
from fastapi import HTTPException


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# # create access token
def create_access_token(user_id: int, expires_delta: timedelta):
    now = datetime.now(timezone.utc)
    expires = now + expires_delta
    payload = {
        "user_id": user_id,
        "exp": expires
    }
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# # insert data into table token
def create_token(user_id: int, access_token: str, expiration_date: datetime, db: Session):
    token = UserSession(
        user_id = user_id,  
        access_token = access_token,
        token_expired=expiration_date,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


# # get all user
def get_all(db: Session):
    return(
        db.query(
            User.pk_id,
            User.name,
            User.email,
            UserRole.name.label("role_name"),
            UserRole.pk_id.label("role_id"),
            UserRight.name.label("user_right"),
            UserRight.pk_id.label("right_id")
        )
        .join(UserRole, User.role_id == UserRole.pk_id, isouter=True)
        .join(UserRight, User.right_id == UserRight.pk_id, isouter=True)
    ).all()

# create or update user
def create(db: Session, user_data: dict):
    if user_data["pk_id"]:
        db_user = db.query(User).filter(User.pk_id == user_data["pk_id"]).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check for duplicate email when updating
        existing_email = db.query(User).filter(
            User.email == user_data["email"],
            User.pk_id != user_data["pk_id"]
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Update data
        db_user.name = user_data["name"]
        db_user.email = user_data["email"]
        db_user.role_id = user_data["role_id"]
        db_user.right_id = user_data["right_id"]
    else:

        # Check for duplicate email when creating
        existing_email = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        #add data
        db_user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=user_data["password"],
            role_id=user_data["role_id"],
            right_id=user_data["right_id"]
        )
        db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# get user by email
def get_by_email(email: str, db: Session):
    return db.query(User).filter(User.email == email).first()

# # check password encript
def verify_password(password: str, hashed_password: str):
    isMatch = bcrypt_context.verify(password, hashed_password)
    return isMatch


# # check token when logout
def check_token_when_logout(access_token: str, db: Session) -> bool:
    try:
        session_token = db.query(UserSession).filter(UserSession.access_token == access_token).first()
    
        if session_token:
            db.delete(session_token)
            db.commit()
            return True
    
        return False

    except Exception:
        db.rollback()
        return False


# # verify refresh token
def verify_refresh_token(token: str, db: Session) -> bool:
    now = datetime.now().replace(microsecond=0)
    refresh_session = db.query(UserSession).filter(
        UserSession.access_token == token,
        UserSession.token_expired > now
    ).first()

    if refresh_session:
        # ✅ Extend expiration correctly
        refresh_session.token_expired = now + timedelta(minutes=120)
        db.commit()
        db.refresh(refresh_session)
        return True  # Token is valid

    return False  # Token invalid or expired

# # verify access token
def verify_access_token(access_token: str, db: Session):
    now = datetime.now().replace(microsecond=0)
    access_token_data = db.query(UserSession).filter(
        UserSession.access_token == access_token,
        UserSession.token_expired > now
    ).first()

    if not access_token_data:
        return None

    return access_token_data

# # get role dropdown
def get_role_dropdown(db: Session):
    roles = db.query(UserRole.pk_id, UserRole.name).all()
    return [{"pk_id": role.pk_id,"role_name": role.name} for role in roles]

# # get right dropdown
def get_right_dropdown(db: Session):
    rights = db.query(UserRight.pk_id, UserRight.name).all()
    return [{"pk_id": right.pk_id,"right_name": right.name} for right in rights]

#get user rights by user id
def get_user_right(user_id: int, db: Session):
    user = db.query(User).filter(User.pk_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.right:
        return {}
    return user.right.rights

#delete user
def delete(db: Session, data: DeleteUser):
    if not data.ids or len(data.ids) == 0:
        raise HTTPException(status_code=400, detail="No IDs provided for deletion")
    
    users = db.query(User).filter(User.pk_id.in_(data.ids)).all()
    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete all users
    for user in users:
        db.delete(user)
    db.commit()
    return {"message": "Users deleted successfully"}