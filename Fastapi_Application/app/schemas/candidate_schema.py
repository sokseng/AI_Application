from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: str 
    gender: str
    phone: Optional[str]
    date_of_birth: Optional[date]
    address1: Optional[str]
    address2: Optional[str]

class CandidateCreate(CandidateBase):
    pk_id: Optional[int] = None
    user_id: int
    password: str
    right_id: int

class CandidateRead(CandidateBase):
    pk_id: int
    model_config = ConfigDict(from_attributes=True)
