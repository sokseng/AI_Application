from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserRightResponse, UserRightCreate, DeleteUserRight
from app.controllers import user_right_controller
from app.database.session import SessionLocal
from passlib.context import CryptContext
from app.dependencies.auth import verify_access_token
import json


router = APIRouter(prefix="/user", tags=["Users right"])
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#get all user right
@router.get("/right", response_model=list[UserRightResponse])
def get_users(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    return user_right_controller.get_all(db)

#create or update user right
@router.post("/right", response_model=UserRightResponse)
def create_right(right: UserRightCreate, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return user_right_controller.create_right(db, right)

#get user right by id
@router.get("/right/{right_id}")
def get_right_by_id(right_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    rights_json = user_right_controller.get_right_by_id(db, right_id)
    if not rights_json:
        return None
    if isinstance(rights_json, str):
        rights_obj = json.loads(rights_json)
    else:
        rights_obj = rights_json
    return {"rights": rights_obj}

#delete user right
@router.post("/right/delete")
def delete_right(data: DeleteUserRight, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return user_right_controller.delete_right(db, data)