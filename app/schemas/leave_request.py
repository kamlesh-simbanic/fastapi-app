from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.leave_request import LeaveStatus, LeaveType


class LeaveRequestBase(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str | None = None


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
    created_by_id: int | None

    model_config = ConfigDict(from_attributes=True)
