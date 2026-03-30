from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import or_

from .. import models, schemas, utils

def add_class(db: Session, class_schema: schemas.SchoolClassCreate, current_user_id: int):
    # Check if a class with the same standard and division already exists
    existing = db.query(models.SchoolClass).filter(
        models.SchoolClass.standard == class_schema.standard,
        models.SchoolClass.division == class_schema.division
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class already exists")

    new_class = models.SchoolClass(
        **class_schema.model_dump(),
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

def get_class(db: Session, class_id: int):
    school_class = db.query(models.SchoolClass).options(joinedload(models.SchoolClass.class_teacher)).filter(models.SchoolClass.id == class_id).first()
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return school_class

def list_classes(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc", search: Optional[str] = None):
    query = db.query(models.SchoolClass).options(joinedload(models.SchoolClass.class_teacher))
    
    if search:
        query = query.filter(
            or_(
                models.SchoolClass.standard.ilike(f"%{search}%"),
                models.SchoolClass.division.ilike(f"%{search}%")
            )
        )

    total = query.count()
    items = utils.apply_pagination_sort(query, models.SchoolClass, skip, limit, sort_by, order).all()
    
    return {"items": items, "total": total}

def update_class(db: Session, class_id: int, class_schema: schemas.SchoolClassUpdate, current_user_id: int):
    db_class = get_class(db, class_id)
    
    update_data = class_schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    
    db_class.updated_by_id = current_user_id
    
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int):
    db_class = get_class(db, class_id)
    db.delete(db_class)
    db.commit()
    return {"detail": "Class deleted successfully"}
