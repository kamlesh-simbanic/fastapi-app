from datetime import datetime

from pydantic import BaseModel


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
    subject: SubjectMinimal | None = None
    teacher: StaffMinimal | None = None

    class Config:
        from_attributes = True


class ClassTimetableResponse(BaseModel):
    class_id: int
    standard: str
    division: str
    schedule: list[Timetable]
