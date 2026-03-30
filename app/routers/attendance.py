from fastapi import APIRouter, Depends, HTTPException, status, Query
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

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def add_attendance_bulk_new(
    data: schemas.AttendanceBulkCreateNew, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.add_attendance_bulk_new(db, data, current_user.id)

@router.get("/", response_model=List[schemas.AttendanceOut])
def view_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    sort_by: str = "date",
    order: str = "desc",
    class_id: Optional[int] = None,
    day: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.view_attendance(db, skip, limit, sort_by, order, class_id, day, month, year)

@router.get("/report/monthly", response_model=List[schemas.StudentAttendanceReport])
def view_monthly_attendance_report(
    month: int,
    year: int,
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.attendance.view_monthly_attendance_report(db, month, year, class_id)
