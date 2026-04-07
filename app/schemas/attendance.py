from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"


class AttendanceRecord(BaseModel):
    student_id: int
    status: str  # "P" or "A"


class AttendanceBase(BaseModel):
    class_id: int
    date: date
    records: list[AttendanceRecord]


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(AttendanceBase):
    pass


class AttendanceOut(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceBulkCreateNew(AttendanceBase):
    pass


class StudentAttendanceReport(BaseModel):
    student_id: int
    name: str
    surname: str
    gr_no: str
    total_days: int
    present_days: int
    absent_days: int
    attendance_percentage: float
    data: dict[str, str]  # Format { "1": "present", "2": "absent", ... }
