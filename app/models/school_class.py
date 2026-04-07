from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class SchoolClass(Base):
    __tablename__ = "school_classes"

    id = Column(Integer, primary_key=True, index=True)
    standard = Column(String(50), index=True)
    division = Column(String(10), index=True)
    class_teacher_id = Column(Integer, ForeignKey("staff.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    class_teacher = relationship("Staff")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
