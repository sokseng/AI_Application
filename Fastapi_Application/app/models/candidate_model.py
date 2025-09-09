from sqlalchemy import Column, Integer, ForeignKey, String
from app.database.session import Base
from sqlalchemy.orm import relationship

class Candidate(Base):
    __tablename__ = "t_candidate"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    address1 = Column(String, nullable=True)
    address2 = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("t_user.pk_id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="candidates")
    cover_letters = relationship(
        "CoverLetter",
        back_populates="candidate",
        cascade="all, delete-orphan",
        passive_deletes=True
    )