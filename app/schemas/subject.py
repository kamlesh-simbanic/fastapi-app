from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .staff import StaffOut
from .user import UserOut

class SubjectBase(BaseModel):
    name: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    name: Optional[str] = None

class Subject(SubjectBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None
    
    # Optional relationships to include in response
    created_by: Optional[UserOut] = None
    updated_by: Optional[UserOut] = None

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
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None
    
    subject: Optional[Subject] = None
    teacher: Optional[StaffOut] = None
    created_by: Optional[UserOut] = None
    updated_by: Optional[UserOut] = None

# For listing subjects with their assigned teachers
class SubjectWithTeachers(Subject):
    teachers: List[TeacherSubject] = []
