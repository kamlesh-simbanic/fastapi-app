import enum
from datetime import datetime

from sqlalchemy import (
    JSON,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("school_classes.id"), index=True)
    date = Column(Date, index=True)
    records = Column(JSON)  # [{"student_id": 1, "status": "P"}, ...]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    school_class = relationship("SchoolClass")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])

    __table_args__ = (UniqueConstraint("class_id", "date", name="uix_class_date"),)
