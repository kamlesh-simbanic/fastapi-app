import enum
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Department(str, enum.Enum):
    TEACHING = "teaching"
    MANAGEMENT = "management"
    ADMIN = "admin"
    OTHER = "other"


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    mobile = Column(String(15), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    dob = Column(Date)
    department = Column(Enum(Department), index=True)
    qualification = Column(String(255))
    address = Column(String(255))
    city = Column(String(100))
    zip_code = Column(String(15))
    leave_balance = Column(Integer, default=20)

    user_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
