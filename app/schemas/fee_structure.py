from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FeeStructureBase(BaseModel):
    class_id: int
    year: int
    fee_amount: float


class FeeStructureCreate(FeeStructureBase):
    pass


class FeeStructureUpdate(BaseModel):
    class_id: int | None = None
    year: int | None = None
    fee_amount: float | None = None


class FeeStructure(FeeStructureBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None
    updated_by_id: int | None

    model_config = ConfigDict(from_attributes=True)


from .school_class import SchoolClass  # noqa: E402


class FeeStructureDetailed(FeeStructure):
    class_name: str | None = None
    created_by_name: str | None = None
    school_class: SchoolClass | None = None
