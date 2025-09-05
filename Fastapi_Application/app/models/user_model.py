
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from app.database.session import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

class UserRole(Base):
    __tablename__ = "t_user_role"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    users = relationship("User", back_populates="role")

class UserRight(Base):
    __tablename__ = "t_user_right"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    rights = Column(JSONB)
    users = relationship("User", back_populates="right")


class UserSession(Base):
    __tablename__ = "t_user_session"

    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("t_user.pk_id", ondelete="CASCADE"), nullable=False)
    access_token = Column(Text, nullable=False)
    token_expired = Column(DateTime, nullable=False)  # stores both date & time
    session_creation_date = Column(DateTime, default=func.now(), nullable=False)
    ip_address = Column(String, nullable=True)

    user = relationship("User", back_populates="sessions")


class User(Base):
    __tablename__ = "t_user"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    role_id = Column(Integer, ForeignKey("t_user_role.pk_id"), nullable=True)
    right_id = Column(Integer, ForeignKey("t_user_right.pk_id"), nullable=True)

    role = relationship("UserRole", back_populates="users")
    right = relationship("UserRight", back_populates="users")
    sessions = relationship("UserSession", back_populates="user")
    candidates = relationship("Candidate", back_populates="user")
    #cover_letters = relationship("CoverLetter", back_populates="user")