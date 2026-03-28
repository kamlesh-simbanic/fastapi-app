from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class SchoolClassBase(BaseModel):
    standard: str
    division: str
    class_teacher_id: Optional[int] = None

class SchoolClassCreate(SchoolClassBase):
    pass

class SchoolClassUpdate(BaseModel):
    standard: Optional[str] = None
    division: Optional[str] = None
    class_teacher_id: Optional[int] = None

class StaffSimple(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class SchoolClass(SchoolClassBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int
    updated_by_id: int
    class_teacher: Optional[StaffSimple] = None

    model_config = ConfigDict(from_attributes=True)
