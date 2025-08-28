from sqlalchemy import Column, Integer, ForeignKey, Text, Date
from app.database.session import Base
from sqlalchemy.orm import relationship
from datetime import date

class CoverLetter(Base):
    __tablename__ = "t_cover_letter"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    fk_candidate = Column(Integer, ForeignKey("t_candidate.pk_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(Text, nullable=True)
    created_date = Column(Date, nullable=False, default=date.today())
    updated_date = Column(Date, nullable=False, default=date.today())
    candidates = relationship("Candidate", back_populates="cover_letters")