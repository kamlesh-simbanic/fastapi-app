from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
import enum
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    email = Column(String(255), unique=True, index=True)
    mobile = Column(String(20), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    description = Column(String(500))
    status = Column(SQLAlchemyEnum(TaskStatus), default=TaskStatus.PENDING)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
