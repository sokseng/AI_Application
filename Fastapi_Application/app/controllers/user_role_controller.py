
from sqlalchemy.orm import Session
from app.models.user_model import UserRole
from passlib.context import CryptContext
from app.config.settings import settings  # secret + algorithm from env/config


SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')


# # get all user role
def get_all(db: Session):
    return db.query(UserRole).order_by(UserRole.name).all()