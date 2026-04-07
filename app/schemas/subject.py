from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .staff import StaffOut
from .user import UserOut


class SubjectBase(BaseModel):
    name: str


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(SubjectBase):
    name: str | None = None


class Subject(SubjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None

    # Optional relationships to include in response
    created_by: UserOut | None = None
    updated_by: UserOut | None = None


class TeacherSubjectBase(BaseModel):
    subject_id: int
    teacher_id: int


class TeacherSubjectCreate(TeacherSubjectBase):
    pass


class TeacherSubject(TeacherSubjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None

    subject: Subject | None = None
    teacher: StaffOut | None = None
    created_by: UserOut | None = None
    updated_by: UserOut | None = None


# For listing subjects with their assigned teachers
class SubjectWithTeachers(Subject):
    teachers: list[TeacherSubject] = []
