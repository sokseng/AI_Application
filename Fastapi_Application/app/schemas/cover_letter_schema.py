from pydantic import BaseModel, ConfigDict

class CoverLetterBase(BaseModel):
    content: str
    status: str

class CoverLetterCreate(CoverLetterBase):
    pk_id: int

class CoverLetterRead(CoverLetterBase):
    pk_id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)