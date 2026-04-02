from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List
from ..models.leave_request import LeaveType, LeaveStatus

class LeaveRequestBase(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: LeaveStatus

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    staff_id: int
    status: LeaveStatus
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True)
