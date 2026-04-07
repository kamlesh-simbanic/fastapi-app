from datetime import date
from enum import Enum

from pydantic import BaseModel


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
    gr_no: str | None = None
    name: str | None = None
    father_name: str | None = None
    surname: str | None = None
    mobile: str | None = None
    dob: date | None = None
    address: str | None = None
    city: str | None = None
    zip_code: str | None = None
    status: StudentStatus | None = None


class StudentOut(StudentBase):
    id: int
    gr_no: str

    class Config:
        from_attributes = True


class StudentList(BaseModel):
    items: list[StudentOut]
    total: int
