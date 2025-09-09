
from fastapi import APIRouter, Depends, Request, HTTPException, Body
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, DeleteUser, AccessToken, UserLogin, UserResponseData
from app.controllers import user_controller
from app.database.session import SessionLocal
from passlib.context import CryptContext
from datetime import timedelta, datetime
from app.dependencies.auth import verify_access_token
from app.utils.token import verify_token


router = APIRouter(prefix="/user", tags=["Users"])
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#get all user
@router.get("/", response_model=list[UserResponseData])
def get_users(db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    # Now the token is verified, and you can access current_user_id
    user = user_controller.get_all(db)
    return [
        {
            "pk_id": u.pk_id,
            "name": u.name,
            "email": u.email,
            "role_id": u.role_id,
            "role_name": u.role_name,
            "right_id": u.right_id,
            "user_right": u.user_right,
            "status": u.status
        }
        for u in user
    ]


# # create or update user
@router.post("/", response_model=UserCreate)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    #hashed_password = bcrypt_context.hash(user.password)

    user_data = {
        "pk_id": user.pk_id,
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "role_id": user.role_id,
        "right_id": user.right_id
    }

    db_user = user_controller.create(db, user_data)
    return db_user

        

# # user login for get token
@router.post("/login", response_model=AccessToken)
def create_login(request: Request,data: UserLogin, db: Session = Depends(get_db)):
    access_token_expires = timedelta(minutes=120)
    now = datetime.now().replace(microsecond=0)

    #Get user
    user = user_controller.get_by_email(data.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    #get user rights
    rights = user_controller.get_user_right(user.pk_id, db)

    #check exist access token
    if data.access_token:
        existing_access_token = user_controller.verify_access_token(data.access_token, db)
        if existing_access_token:
            return AccessToken(access_token=existing_access_token.access_token, rights=rights)
    
    #Verify password
    isMatch = user_controller.verify_password(data.password, user.password)
    if not isMatch:
        raise HTTPException(status_code=404, detail="Invalid password")

    #create access token
    access_token = user_controller.create_access_token(user.pk_id, expires_delta=access_token_expires)
    
    ip_address = request.client.host

    # Save access token
    user_controller.create_token(
        ip_address=ip_address,
        user_id=user.pk_id,
        access_token=access_token,
        expiration_date=(now + access_token_expires).strftime("%Y-%m-%d %H:%M:%S"),
        db=db
    )

    return AccessToken(
        access_token=access_token,
        rights=rights
    )

# erify token
@router.post("/verify_token", response_model=bool)
def verify_token(token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    token = user_controller.verify_refresh_token(token, db)
    return token


#user logout
@router.post("/logout", response_model=bool)
def logout(access_token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    return user_controller.check_token_when_logout(access_token, db)


@router.get("/role_dropdown")
def get_role_dropdown(db: Session = Depends(get_db)):
    return user_controller.get_role_dropdown(db)

@router.get("/right_dropdown")
def get_right_dropdown(db: Session = Depends(get_db)):
    return user_controller.get_right_dropdown(db)

#delete mutiple users
@router.post("/delete")
def delete_users(data: DeleteUser, db: Session = Depends(get_db), current_user_id: int = Depends(verify_access_token)):
    return user_controller.delete(db, data)