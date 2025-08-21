from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AuditTraceBase(BaseModel):
    user_acction: str
    action: str
    id: Optional[str] = None
    detail_information: Optional[str] = None

class AuditTraceCreate(AuditTraceBase):
    action_datetime: datetime

class AuditTraceRead(AuditTraceBase):
    pk_id: int
    action_datetime: datetime
    model_config = ConfigDict(from_attributes=True)

