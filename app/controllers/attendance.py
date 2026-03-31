from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract, and_, or_
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import date, datetime

from .. import models, schemas, utils

def add_attendance_bulk_new(db: Session, data: schemas.AttendanceBulkCreateNew, current_user_id: int):
    # Check if a record already exists for this class and date
    existing = db.query(models.Attendance).filter(
        models.Attendance.class_id == data.class_id,
        models.Attendance.date == data.date
    ).first()

    records_json = [r.model_dump() for r in data.records]

    if existing:
        existing.records = records_json
        existing.updated_at = datetime.utcnow()
        existing.updated_by_id = current_user_id
    else:
        new_attendance = models.Attendance(
            class_id=data.class_id,
            date=data.date,
            records=records_json,
            created_by_id=current_user_id,
            updated_by_id=current_user_id
        )
        db.add(new_attendance)

    db.commit()
    return {"detail": "Attendance recorded successfully"}

def view_attendance(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "date", order: str = "desc", class_id: Optional[int] = None, day: Optional[date] = None, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(models.Attendance).options(joinedload(models.Attendance.school_class))
    
    if class_id:
        query = query.filter(models.Attendance.class_id == class_id)
    if day:
        query = query.filter(models.Attendance.date == day)
    if month:
        query = query.filter(extract('month', models.Attendance.date) == month)
    if year:
        query = query.filter(extract('year', models.Attendance.date) == year)

    return utils.apply_pagination_sort(query, models.Attendance, skip, limit, sort_by, order).all()

def view_monthly_attendance_report(db: Session, month: int, year: int, class_id: int):
    # Get class students
    class_mapping = db.query(models.ClassStudent).filter(models.ClassStudent.class_id == class_id).first()
    if not class_mapping:
        return []
    
    students = db.query(models.Student).filter(models.Student.id.in_(class_mapping.students)).all()
    student_meta = {s.id: {"name": s.name, "surname": s.surname, "gr_no": s.gr_no} for s in students}

    records = db.query(models.Attendance).filter(
        and_(
            extract('month', models.Attendance.date) == month,
            extract('year', models.Attendance.date) == year,
            models.Attendance.class_id == class_id
        )
    ).all()

    report_dict = {}
    for s_id, meta in student_meta.items():
        report_dict[s_id] = {
            "student_id": s_id,
            "name": meta["name"],
            "surname": meta["surname"],
            "gr_no": meta["gr_no"],
            "total_days": len(records),
            "present_days": 0,
            "absent_days": 0,
            "attendance_percentage": 0.0,
            "data": {}
        }

    for record in records:
        day = str(record.date.day)
        for r in record.records:
            s_id = r.get("student_id")
            if s_id in report_dict:
                status = r.get("status")
                is_present = status == "P" or status == "present"
                report_dict[s_id]["data"][day] = "present" if is_present else "absent"
                if is_present:
                    report_dict[s_id]["present_days"] += 1
                else:
                    report_dict[s_id]["absent_days"] += 1

    for s_id in report_dict:
        total = report_dict[s_id]["total_days"]
        if total > 0:
            present = report_dict[s_id]["present_days"]
            report_dict[s_id]["attendance_percentage"] = round((present / total) * 100, 1)

    return list(report_dict.values())
