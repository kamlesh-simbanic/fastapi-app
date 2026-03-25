from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
import enum
from ..database import Base

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
