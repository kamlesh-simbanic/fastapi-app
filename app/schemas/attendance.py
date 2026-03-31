from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional, Dict
from enum import Enum
from .student import StudentMinimal

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"

class AttendanceRecord(BaseModel):
    student_id: int
    status: str # "P" or "A"

class AttendanceBase(BaseModel):
    class_id: int
    date: date
    records: List[AttendanceRecord]

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
    data: Dict[str, str] # Format { "1": "present", "2": "absent", ... }
