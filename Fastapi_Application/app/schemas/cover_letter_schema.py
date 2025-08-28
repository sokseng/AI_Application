from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class CoverLetterBase(BaseModel):
    content: str
    #status: Optional[str] = None

class CoverLetterCreate(CoverLetterBase):
    pk_id: Optional[int] = None
    fk_candidate: int

class DeleteCoverLetter(BaseModel):
    ids: list[int]

class CoverLetterCandidateDropdown(BaseModel):
    pk_id: int
    candidate_name: str

class CoverLetterRead(CoverLetterBase):
    pk_id: int
    fk_candidate: int
    first_name: str
    last_name: str
    created_date: date
    updated_date: date
    model_config = ConfigDict(from_attributes=True)