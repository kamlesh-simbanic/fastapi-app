from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import or_

from .. import models, schemas, utils

def add_class_student(db: Session, student_schema: schemas.ClassStudentCreate, current_user_id: int):
    # Check if entry already exists for the same academic year and class
    existing = db.query(models.ClassStudent).filter(
        models.ClassStudent.academic_year == student_schema.academic_year,
        models.ClassStudent.class_id == student_schema.class_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Class mapping for this academic year already exists")

    new_mapping = models.ClassStudent(
        **student_schema.model_dump(),
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_mapping)
    db.commit()
    db.refresh(new_mapping)
    return new_mapping

def get_class_student(db: Session, mapping_id: int):
    mapping = db.query(models.ClassStudent).options(joinedload(models.ClassStudent.school_class)).filter(models.ClassStudent.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Class mapping not found")
    return mapping

def list_class_students(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc", academic_year: Optional[str] = None):
    query = db.query(models.ClassStudent).options(joinedload(models.ClassStudent.school_class))
    
    if academic_year:
        query = query.filter(models.ClassStudent.academic_year == academic_year)

    total = query.count()
    items = utils.apply_pagination_sort(query, models.ClassStudent, skip, limit, sort_by, order).all()
    
    return {"items": items, "total": total}

def update_class_student(db: Session, mapping_id: int, student_schema: schemas.ClassStudentUpdate, current_user_id: int):
    db_mapping = get_class_student(db, mapping_id)
    
    update_data = student_schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_mapping, key, value)
    
    db_mapping.updated_by_id = current_user_id
    
    db.commit()
    db.refresh(db_mapping)
    return db_mapping

def delete_class_student(db: Session, mapping_id: int):
    db_mapping = get_class_student(db, mapping_id)
    db.delete(db_mapping)
    db.commit()
    return {"detail": "Class mapping deleted successfully"}

def get_students_by_class(db: Session, class_id: int):
    mapping = db.query(models.ClassStudent).filter(models.ClassStudent.class_id == class_id).order_by(models.ClassStudent.id.desc()).first()
    if not mapping or not mapping.students:
        return []
    
    student_ids = mapping.students
    students = db.query(models.Student).filter(models.Student.id.in_(student_ids)).all()
    return students
