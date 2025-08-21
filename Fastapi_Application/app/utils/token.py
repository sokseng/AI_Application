from jose import JWTError, jwt
from fastapi import HTTPException, status
from app.config.settings import settings
from app.controllers import user_controller
from sqlalchemy.orm import Session
from datetime import  datetime

def verify_token(token: str, db: Session) -> int:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_exp": False})
        user_id = payload.get("user_id")

        if user_id is None:
            raise ValueError("Missing user_id")
        
        return int(user_id)
    
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
