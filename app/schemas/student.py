from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class StudentStatus(str, Enum):
    ACTIVE = "active"
    TERMINATED = "terminated"

class StudentBase(BaseModel):
    name: str
    father_name: str
    surname: str
    mobile: str
    dob: date
    address: str
    city: str
    zip_code: str
    status: StudentStatus = StudentStatus.ACTIVE

class StudentCreate(StudentBase):
    pass

class StudentMinimal(BaseModel):
    name: str
    father_name: str
    surname: str
    mobile: str

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    gr_no: Optional[str] = None
    name: Optional[str] = None
    father_name: Optional[str] = None
    surname: Optional[str] = None
    mobile: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    status: Optional[StudentStatus] = None

class StudentOut(StudentBase):
    id: int
    gr_no: str

    class Config:
        from_attributes = True
