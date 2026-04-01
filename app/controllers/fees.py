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

def get_suggested_fee(db: Session, gr_no: str, year: int):
    # Find student by GR Number
    student = db.query(models.Student).filter(models.Student.gr_no == gr_no).first()
    if not student:
        return {"fee_amount": 0}
    
    student_id = student.id
    year_str = str(year)
    
    # Refined search: prefer academic years starting with the year (e.g. 2025-26)
    mappings = db.query(models.ClassStudent).filter(
        models.ClassStudent.academic_year.startswith(year_str)
    ).all()
    
    # Fallback
    if not mappings:
        mappings = db.query(models.ClassStudent).filter(
            models.ClassStudent.academic_year.contains(year_str)
        ).all()
    
    relevant_class_id = None
    for m in mappings:
        if m.students and student.id in m.students:
            relevant_class_id = m.class_id
            break
            
    if not relevant_class_id:
        raise HTTPException(status_code=404, detail="Student not assigned to any class for this year")
    
    # Now find the fee structure for this class and year
    fee_structure = db.query(models.FeeStructure).filter(
        models.FeeStructure.class_id == relevant_class_id,
        models.FeeStructure.year == year
    ).first()
    
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not defined for this student's class and year")
    
    return {"fee_amount": fee_structure.fee_amount}
