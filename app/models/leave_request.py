from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class LeaveType(enum.Enum):
    SICK = "sick"
    CASUAL = "casual"
    PERSONAL = "personal"
    OTHER = "other"

class LeaveStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(255))
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    
    # Audit info
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    staff = relationship("Staff", foreign_keys=[staff_id], backref="leave_requests")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
