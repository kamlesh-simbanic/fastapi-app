from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional
from .student import StudentOut

class ClassStudentBase(BaseModel):
    academic_year: str
    class_id: int
    students: List[int]

class ClassStudentCreate(ClassStudentBase):
    pass

class ClassStudentUpdate(BaseModel):
    academic_year: Optional[str] = None
    class_id: Optional[int] = None
    students: Optional[List[int]] = None

class SchoolClassSimple(BaseModel):
    id: int
    standard: str
    division: str
    model_config = ConfigDict(from_attributes=True)

class ClassStudent(ClassStudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None
    
    school_class: Optional[SchoolClassSimple] = None
    student_details: Optional[List[StudentOut]] = None

    model_config = ConfigDict(from_attributes=True)

class ClassStudentList(BaseModel):
    items: list[ClassStudent]
    total: int
