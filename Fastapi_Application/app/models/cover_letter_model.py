from sqlalchemy import Column, Integer, ForeignKey, Text
from app.database.session import Base
from sqlalchemy.orm import relationship

class CoverLetter(Base):
    __tablename__ = "t_cover_letter"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("t_user.pk_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    user = relationship("User", back_populates="cover_letters")