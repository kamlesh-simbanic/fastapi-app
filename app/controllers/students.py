from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime
from sqlalchemy import or_

from .. import models, schemas, utils

def create_student(db: Session, student_schema: schemas.StudentCreate):
    current_year = datetime.now().year
    prefix = f"GR-{current_year}-"
    
    # Get the latest student for the current year
    last_student = db.query(models.Student).filter(models.Student.gr_no.like(f"{prefix}%")).order_by(models.Student.id.desc()).first()
    
    if last_student:
        try:
            last_serial = int(last_student.gr_no.split("-")[-1])
            new_serial = last_serial + 1
        except (ValueError, IndexError):
            new_serial = 1
    else:
        new_serial = 1
        
    gr_no = f"{prefix}{new_serial:04d}"

    new_student = models.Student(
        gr_no=gr_no,
        **student_schema.model_dump()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

def get_students(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc", search: Optional[str] = None):
    query = db.query(models.Student)
    
    if search:
        query = query.filter(
            or_(
                models.Student.name.ilike(f"%{search}%"),
                models.Student.surname.ilike(f"%{search}%")
            )
        )
    
    return utils.apply_pagination_sort(query, models.Student, skip, limit, sort_by, order).all()

def get_student(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student

def update_student(db: Session, student_id: int, student_update: schemas.StudentUpdate):
    student_query = db.query(models.Student).filter(models.Student.id == student_id)
    student = student_query.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    student_query.update(student_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    db.refresh(student)
    return student

def delete_student(db: Session, student_id: int):
    student_query = db.query(models.Student).filter(models.Student.id == student_id)
    student = student_query.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    student_query.update({"status": models.StudentStatus.TERMINATED}, synchronize_session=False)
    db.commit()
    return None
