from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from .. import models, schemas, utils, controllers
from ..database import get_db
from .auth import get_current_user, check_access

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    dependencies=[Depends(check_access([models.Department.TEACHING]))]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_attendance_bulk(
    bulk_data: schemas.AttendanceBulkCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.add_attendance_bulk(db, bulk_data, current_user.id)

@router.put("/", status_code=status.HTTP_200_OK)
def update_attendance_bulk(
    bulk_data: schemas.AttendanceBulkUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.update_attendance_bulk(db, bulk_data, current_user.id)

@router.get("/", response_model=List[schemas.AttendanceOut])
def view_attendance(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "date",
    order: str = "desc",
    day: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.view_attendance(db, skip, limit, sort_by, order, day, month, year, search)

@router.get("/report/monthly", response_model=List[schemas.StudentAttendanceReport])
def view_monthly_attendance_report(
    month: int,
    year: int,
    standard: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.view_monthly_attendance_report(db, month, year, standard)
