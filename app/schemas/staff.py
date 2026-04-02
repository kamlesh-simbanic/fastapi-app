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
    leave_balance: int = 1

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[date] = None
    department: Optional[Department] = None
    qualification: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None

class StaffOut(StaffBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StaffList(BaseModel):
    items: list[StaffOut]
    total: int
