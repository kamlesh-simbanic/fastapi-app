from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import or_

from .. import models, schemas, utils

def add_payment(db: Session, payment_schema: schemas.FeePaymentCreate, current_user_id: int):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == payment_schema.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_payment = models.FeePayment(
        **payment_schema.model_dump(),
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

def list_payments(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc", term: Optional[schemas.FeeTerm] = None, year: Optional[int] = None, search: Optional[str] = None):
    query = db.query(models.FeePayment).options(joinedload(models.FeePayment.student))
    
    # Filter by term and year
    if term:
        query = query.filter(models.FeePayment.term == term)
    if year:
        query = query.filter(models.FeePayment.year == year)
    
    # Filter by student name (partial match)
    if search:
        query = query.join(models.Student).filter(
            or_(
                models.Student.name.ilike(f"%{search}%"),
                models.Student.surname.ilike(f"%{search}%")
            )
        )

    return utils.apply_pagination_sort(query, models.FeePayment, skip, limit, sort_by, order).all()
