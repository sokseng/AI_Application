from pydantic import BaseModel, ConfigDict

class CandidateBase(BaseModel):
    name: str

class CandidateCreate(CandidateBase):
    user_id: int

class CandidateRead(CandidateCreate):
    pk_id: int
    model_config = ConfigDict(from_attributes=True)
