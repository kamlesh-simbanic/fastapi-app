from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None


class TaskOut(TaskBase):
    id: int
    created_by: int
    updated_by: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
