from .user import UserBase, UserCreate, UserLogin, UserOut, Token, TokenData, AuthResponse
from .task import TaskBase, TaskCreate, TaskUpdate, TaskOut, TaskStatus
from .student import StudentBase, StudentCreate, StudentUpdate, StudentOut, StudentStatus, StudentList
from .fee_payment import FeePaymentCreate, FeePaymentOut, FeeTerm
from .staff import StaffCreate, StaffOut, Department, StaffList, StaffUpdate
from .attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceOut, 
    AttendanceBulkCreate, AttendanceBulkUpdate, AttendanceStatus,
    StudentAttendanceReport
)
from .school_class import SchoolClassBase, SchoolClassCreate, SchoolClassUpdate, SchoolClass,StaffSimple
from .class_student import ClassStudentBase, ClassStudentCreate, ClassStudentUpdate, ClassStudent