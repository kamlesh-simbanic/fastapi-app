from datetime import datetime
from enum import Enum

from pydantic import BaseModel

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
    payment_details: str | None = None


class FeePaymentCreate(FeePaymentBase):
    pass


class FeePaymentOut(FeePaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None
    student: StudentMinimal | None = None

    class Config:
        from_attributes = True
