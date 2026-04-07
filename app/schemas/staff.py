from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class Department(str, Enum):
    TEACHING = "teaching"
    MANAGEMENT = "management"
    ADMIN = "admin"
    OTHER = "other"


class StaffBase(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    dob: date | None = None
    department: Department | None = None
    qualification: str | None = None
    address: str | None = None
    city: str | None = None
    zip_code: str | None = None
    leave_balance: int | None = 20


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: str | None = None
    mobile: str | None = None
    email: EmailStr | None = None
    dob: date | None = None
    department: Department | None = None
    qualification: str | None = None
    address: str | None = None
    city: str | None = None
    zip_code: str | None = None


class StaffOut(StaffBase):
    id: int
    user_id: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StaffList(BaseModel):
    items: list[StaffOut]
    total: int
