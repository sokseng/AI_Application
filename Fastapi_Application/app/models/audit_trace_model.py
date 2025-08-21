from sqlalchemy import Column, Integer,Text, DateTime
from app.database.session import Base

class AuditTrace(Base):
    __tablename__ = "t_audit_trace"
    pk_id = Column(Integer, primary_key=True, autoincrement=True)
    user_action = Column(Text)
    action_datetime = Column(DateTime)
    action = Column(Text)
    ip = Column(Text, nullable=True)
    detail_information = Column(Text, nullable=True)