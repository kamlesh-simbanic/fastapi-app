from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

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
    created_by_id: int
    updated_by_id: int
    
    school_class: Optional[SchoolClassSimple] = None

    model_config = ConfigDict(from_attributes=True)

class ClassStudentList(BaseModel):
    items: list[ClassStudent]
    total: int
