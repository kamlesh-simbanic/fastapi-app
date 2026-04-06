from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from enum import Enum
from .student import StudentMinimal

class FeeTerm(str, Enum):
    SUMMER = "summer"
    WINTER = "winter"

class PaymentMethod(str, Enum):
    cash = "cash"
    upi = "upi"
    cheque = "cheque"

class FeePaymentBase(BaseModel):
    gr_no: str
    student_id: int
    term: FeeTerm
    year: int
    amount: float
    payment_method: PaymentMethod = PaymentMethod.cash
    payment_details: Optional[str] = None

class FeePaymentCreate(FeePaymentBase):
    pass

class FeePaymentOut(FeePaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None
    student: Optional[StudentMinimal] = None

    class Config:
        from_attributes = True
