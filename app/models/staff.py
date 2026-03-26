from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class Department(enum.Enum):
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
    department = Column(Enum(Department))
    qualification = Column(String(255))
    address = Column(String(255))
    city = Column(String(100))
    zip_code = Column(String(15))
    
    user_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    updated_by_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
