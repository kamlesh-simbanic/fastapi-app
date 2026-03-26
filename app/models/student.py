from sqlalchemy import Column, Integer, String, Date, Enum as SQLAlchemyEnum
import enum
from ..database import Base

class StudentStatus(enum.Enum):
    ACTIVE = "active"
    TERMINATED = "terminated"

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    gr_no = Column(String(50), unique=True, index=True)
    name = Column(String(100), index=True)
    father_name = Column(String(100))
    surname = Column(String(100), index=True)
    mobile = Column(String(20), index=True)
    dob = Column(Date)
    address = Column(String(255))
    city = Column(String(100))
    zip_code = Column(String(20))
    status = Column(SQLAlchemyEnum(StudentStatus), default=StudentStatus.ACTIVE)
