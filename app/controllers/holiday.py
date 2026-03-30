from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import date

from .. import models, schemas, utils

def create_holiday(db: Session, holiday: schemas.HolidayCreate, current_user_id: int):
    new_holiday = models.Holiday(
        **holiday.model_dump(),
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_holiday)
    db.commit()
    db.refresh(new_holiday)
    return new_holiday

def get_holidays(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "date", order: str = "asc"):
    query = db.query(models.Holiday)
    return utils.apply_pagination_sort(query, models.Holiday, skip, limit, sort_by, order).all()

def get_holiday(db: Session, holiday_id: int):
    holiday = db.query(models.Holiday).filter(models.Holiday.id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return holiday

def update_holiday(db: Session, holiday_id: int, holiday_update: schemas.HolidayUpdate, current_user_id: int):
    db_holiday = get_holiday(db, holiday_id)
    
    update_data = holiday_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_holiday, key, value)
    
    db_holiday.updated_by_id = current_user_id
    db.commit()
    db.refresh(db_holiday)
    return db_holiday

def delete_holiday(db: Session, holiday_id: int):
    db_holiday = get_holiday(db, holiday_id)
    db.delete(db_holiday)
    db.commit()
    return {"detail": "Holiday deleted successfully"}
