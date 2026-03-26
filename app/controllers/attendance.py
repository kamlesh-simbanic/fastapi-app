from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract, and_, or_
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import date

from .. import models, schemas, utils

def add_attendance_bulk(db: Session, bulk_data: schemas.AttendanceBulkCreate, current_user_id: int):
    attendance_records = []
    for record in bulk_data.records:
        existing = db.query(models.Attendance).filter(
            and_(
                models.Attendance.student_id == record.student_id,
                models.Attendance.date == record.date,
                models.Attendance.period == record.period
            )
        ).first()
        
        if existing:
            continue

        new_attendance = models.Attendance(
            **record.model_dump(),
            created_by_id=current_user_id,
            updated_by_id=current_user_id
        )
        attendance_records.append(new_attendance)

    if attendance_records:
        db.bulk_save_objects(attendance_records)
        db.commit()
    
    return {"detail": f"Successfully added {len(attendance_records)} records"}

def update_attendance_bulk(db: Session, bulk_data: schemas.AttendanceBulkUpdate, current_user_id: int):
    updated_count = 0
    for record in bulk_data.records:
        attendance_query = db.query(models.Attendance).filter(models.Attendance.id == record.id)
        attendance = attendance_query.first()
        if attendance:
            attendance_query.update({
                "status": record.status,
                "updated_by_id": current_user_id,
                "updated_at": date.today()
            }, synchronize_session=False)
            updated_count += 1
    
    db.commit()
    return {"detail": f"Successfully updated {updated_count} records"}

def view_attendance(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "date", order: str = "desc", day: Optional[date] = None, month: Optional[int] = None, year: Optional[int] = None, search: Optional[str] = None):
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

def view_monthly_attendance_report(db: Session, month: int, year: int, standard: str):
    records = db.query(models.Attendance).options(joinedload(models.Attendance.student)).filter(
        and_(
            extract('month', models.Attendance.date) == month,
            extract('year', models.Attendance.date) == year,
            models.Attendance.standard == standard
        )
    ).all()

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
        
        report_dict[student_id]["data"][str(record.date.day)] = record.status

    return list(report_dict.values())
