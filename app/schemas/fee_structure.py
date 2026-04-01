from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class FeeStructureBase(BaseModel):
    class_id: int
    year: int
    fee_amount: float

class FeeStructureCreate(FeeStructureBase):
    pass

class FeeStructureUpdate(BaseModel):
    class_id: Optional[int] = None
    year: Optional[int] = None
    fee_amount: Optional[float] = None

class FeeStructure(FeeStructureBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int]
    updated_by_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

from .school_class import SchoolClass

class FeeStructureDetailed(FeeStructure):
    class_name: Optional[str] = None
    created_by_name: Optional[str] = None
    school_class: Optional[SchoolClass] = None
