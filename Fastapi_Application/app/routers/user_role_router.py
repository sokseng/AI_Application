from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserRoleResponse
from app.controllers import user_role_controller
from app.database.session import SessionLocal
from passlib.context import CryptContext
from app.dependencies.auth import verify_access_token


router = APIRouter(prefix="/user", tags=["Users Role"])
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#get all user role
@router.get("/role", response_model=list[UserRoleResponse])
def get_users(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    return user_role_controller.get_all(db)