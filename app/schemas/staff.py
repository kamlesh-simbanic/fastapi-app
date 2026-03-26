from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional
from enum import Enum

class Department(str, Enum):
    TEACHING = "teaching"
    MANAGEMENT = "management"
    ADMIN = "admin"
    OTHER = "other"

class StaffBase(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    dob: date
    department: Department
    qualification: str
    address: str
    city: str
    zip_code: str

class StaffCreate(StaffBase):
    pass

class StaffOut(StaffBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
