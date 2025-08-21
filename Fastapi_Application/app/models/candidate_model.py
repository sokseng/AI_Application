from sqlalchemy import Column, Integer, ForeignKey, String
from app.database.session import Base
from sqlalchemy.orm import relationship

class Candidate(Base):
    __tablename__ = "t_candidate"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("t_user.pk_id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="candidates")