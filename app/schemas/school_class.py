from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SchoolClassBase(BaseModel):
    standard: str
    division: str
    class_teacher_id: int | None = None


class SchoolClassCreate(SchoolClassBase):
    pass


class SchoolClassUpdate(BaseModel):
    standard: str | None = None
    division: str | None = None
    class_teacher_id: int | None = None


class StaffSimple(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class SchoolClass(SchoolClassBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None
    class_teacher: StaffSimple | None = None

    model_config = ConfigDict(from_attributes=True)


class SchoolClassList(BaseModel):
    items: list[SchoolClass]
    total: int
