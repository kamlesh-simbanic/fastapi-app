from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SubjectMinimal(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class StaffMinimal(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class TimetableBase(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int
    day_of_week: str
    period_number: int

class TimetableCreate(TimetableBase):
    pass

class Timetable(TimetableBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    # Optional nested data for response
    subject: Optional[SubjectMinimal] = None
    teacher: Optional[StaffMinimal] = None

    class Config:
        from_attributes = True

class ClassTimetableResponse(BaseModel):
    class_id: int
    standard: str
    division: str
    schedule: List[Timetable]
