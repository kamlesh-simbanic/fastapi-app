from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from enum import Enum
from .student import StudentMinimal

class FeeTerm(str, Enum):
    SUMMER = "summer"
    WINTER = "winter"

class FeePaymentBase(BaseModel):
    gr_no: str
    student_id: int
    term: FeeTerm
    year: int
    amount: float

class FeePaymentCreate(FeePaymentBase):
    pass

class FeePaymentOut(FeePaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int
    updated_by_id: int
    student: Optional[StudentMinimal] = None

    class Config:
        from_attributes = True
