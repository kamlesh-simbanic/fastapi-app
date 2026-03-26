from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract, and_
from typing import List, Optional
from datetime import date

from .. import models, schemas, utils
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_attendance_bulk(
    bulk_data: schemas.AttendanceBulkCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    attendance_records = []
    for record in bulk_data.records:
        # Check if already exists (to avoid unique constraint violation in bulk)
        existing = db.query(models.Attendance).filter(
            and_(
                models.Attendance.student_id == record.student_id,
                models.Attendance.date == record.date,
                models.Attendance.period == record.period
            )
        ).first()
        
        if existing:
            continue # Or we could update it, but requirements said "add" and "update" separate.

        new_attendance = models.Attendance(
            **record.model_dump(),
            created_by_id=current_user.id,
            updated_by_id=current_user.id
        )
        attendance_records.append(new_attendance)

    if attendance_records:
        db.bulk_save_objects(attendance_records)
        db.commit()
    
    return {"detail": f"Successfully added {len(attendance_records)} records"}

@router.put("/", status_code=status.HTTP_200_OK)
def update_attendance_bulk(
    bulk_data: schemas.AttendanceBulkUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    updated_count = 0
    for record in bulk_data.records:
        attendance_query = db.query(models.Attendance).filter(models.Attendance.id == record.id)
        attendance = attendance_query.first()
        if attendance:
            attendance_query.update({
                "status": record.status,
                "updated_by_id": current_user.id,
                "updated_at": date.today() # SQLAlchemy will use datetime.utcnow via onupdate anyway
            }, synchronize_session=False)
            updated_count += 1
    
    db.commit()
    return {"detail": f"Successfully updated {updated_count} records"}

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
    query = db.query(models.Attendance).options(joinedload(models.Attendance.student))
    
    if day:
        query = query.filter(models.Attendance.date == day)
    
    if month:
        query = query.filter(extract('month', models.Attendance.date) == month)
    
    if year:
        query = query.filter(extract('year', models.Attendance.date) == year)
    
    if search:
        query = query.join(models.Student).filter(
            or_(
                models.Student.name.ilike(f"%{search}%"),
                models.Student.surname.ilike(f"%{search}%")
            )
        )

    return utils.apply_pagination_sort(query, models.Attendance, skip, limit, sort_by, order).all()

@router.get("/report/monthly", response_model=List[schemas.StudentAttendanceReport])
def view_monthly_attendance_report(
    month: int,
    year: int,
    standard: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch all records for the filters
    records = db.query(models.Attendance).options(joinedload(models.Attendance.student)).filter(
        and_(
            extract('month', models.Attendance.date) == month,
            extract('year', models.Attendance.date) == year,
            models.Attendance.standard == standard
        )
    ).all()

    # Group by student
    report_dict = {}
    for record in records:
        student_id = record.student_id
        if student_id not in report_dict:
            report_dict[student_id] = {
                "student_id": student_id,
                "name": record.student.name,
                "surname": record.student.surname,
                "data": {}
            }
        
        # Populate daily status (Day Number: Status)
        # If multiple periods exist for the same day, the last one will be shown
        report_dict[student_id]["data"][str(record.date.day)] = record.status

    return list(report_dict.values())
