# app/config/settings.py

#from pydantic_settings import BaseSettings
#from pydantic import BaseSettings
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "77407c7339a6c00544e51af1101c4abb4aea2a31157ca5f7dfd87da02a628107"
    JWT_ALGORITHM: str = "HS256"

settings = Settings()
