from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    gr_no = Column(String(50), index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    standard = Column(String(20))
    period = Column(Integer)
    date = Column(Date, index=True)
    status = Column(Enum(AttendanceStatus))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    student = relationship("Student")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])

    __table_args__ = (
        UniqueConstraint('student_id', 'date', 'period', name='uix_student_date_period'),
    )
