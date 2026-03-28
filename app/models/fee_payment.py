from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class FeeTerm(enum.Enum):
    SUMMER = "summer"
    WINTER = "winter"

class PaymentMethod(enum.Enum):
    cash = "cash"
    upi = "upi"
    cheque = "cheque"

class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(Integer, primary_key=True, index=True)
    gr_no = Column(String(50), index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    term = Column(Enum(FeeTerm), index=True)
    year = Column(Integer, index=True)
    amount = Column(Float)
    
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cash)
    payment_details = Column(String(255), nullable=True) # upi_transaction id, cheque no
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    student = relationship("Student")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
