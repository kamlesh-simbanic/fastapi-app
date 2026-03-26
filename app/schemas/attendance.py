from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
from enum import Enum
from .student import StudentMinimal

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"

class AttendanceBase(BaseModel):
    gr_no: str
    student_id: int
    standard: str
    period: int
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    id: int # Required for bulk updates
    status: AttendanceStatus

class AttendanceOut(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    student: Optional[StudentMinimal] = None

    class Config:
        from_attributes = True

class AttendanceBulkCreate(BaseModel):
    records: List[AttendanceCreate]

class AttendanceBulkUpdate(BaseModel):
    records: List[AttendanceUpdate]

class StudentAttendanceReport(BaseModel):
    student_id: int
    name: str
    # surname: str
    data: dict # Format { "1": "present", "2": "absent", ... }
