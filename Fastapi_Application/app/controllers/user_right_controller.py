
from sqlalchemy.orm import Session
from app.models.user_model import UserRight, User
from app.schemas.user_schema import UserRightCreate, DeleteUserRight
from passlib.context import CryptContext
from app.config.settings import settings  # secret + algorithm from env/config
from fastapi import HTTPException


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')


# # get all user role
def get_all(db: Session):
    return db.query(UserRight).order_by(UserRight.name).all()

#create or update user rights
def create_right(db: Session, right: UserRightCreate):
    if right.pk_id:
        db_right = db.query(UserRight).filter(UserRight.pk_id == right.pk_id).first()
        if not db_right:
            raise HTTPException(status_code=404, detail="Right not found")
        
        # Check for duplicate name when updating
        existing_name = db.query(UserRight).filter(
            UserRight.name == right.name, 
            UserRight.pk_id != right.pk_id
        ).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Right name already exists")

        # Update data
        db_right.name = right.name
        db_right.description = right.description
        db_right.rights = right.rights
        
    else:

        # Check for duplicate name when creating
        existing_name = db.query(UserRight).filter(UserRight.name == right.name).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Right name already exists")

        #add data
        db_right = UserRight(
            pk_id=right.pk_id,
            name=right.name,
            description=right.description,
            rights=right.rights   # Dict automatically stored in JSONB
        )
        db.add(db_right)

    db.commit()
    db.refresh(db_right)
    return db_right

#get right by id
def get_right_by_id(db: Session, right_id: int):
    return db.query(UserRight.rights).filter(UserRight.pk_id == right_id).scalar()


#delete right
def delete_right(db: Session, data: DeleteUserRight):
    if not data.ids:
        raise HTTPException(status_code=400, detail="No IDs provided for deletion")
    
    being_used = db.query(User).filter(User.right_id.in_(data.ids)).first()
    if being_used:
        raise HTTPException(status_code=400, detail="Right is being used by user")

    rights = db.query(UserRight).filter(UserRight.pk_id.in_(data.ids)).all()
    if not rights:
        raise HTTPException(status_code=404, detail="Right not found")

    # Delete all rights
    for right in rights:
        db.delete(right)
    db.commit()
    return {"message": "Rights deleted successfully"}