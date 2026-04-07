from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .student import StudentOut


class ClassStudentBase(BaseModel):
    academic_year: str
    class_id: int
    students: list[int]


class ClassStudentCreate(ClassStudentBase):
    pass


class ClassStudentUpdate(BaseModel):
    academic_year: str | None = None
    class_id: int | None = None
    students: list[int] | None = None


class SchoolClassSimple(BaseModel):
    id: int
    standard: str
    division: str
    model_config = ConfigDict(from_attributes=True)


class ClassStudent(ClassStudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None

    school_class: SchoolClassSimple | None = None
    student_details: list[StudentOut] | None = None

    model_config = ConfigDict(from_attributes=True)


class ClassStudentList(BaseModel):
    items: list[ClassStudent]
    total: int
