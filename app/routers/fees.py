from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional

from .. import models, schemas, utils
from ..database import get_db
from .auth import get_current_user, check_access

router = APIRouter(
    prefix="/fees",
    tags=["fees"],
    dependencies=[Depends(check_access([models.Department.MANAGEMENT, models.Department.ADMIN]))]
)

@router.post("/", response_model=schemas.FeePaymentOut, status_code=status.HTTP_201_CREATED)
def add_payment(
    payment: schemas.FeePaymentCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == payment.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_payment = models.FeePayment(
        **payment.model_dump(),
        created_by_id=current_user.id,
        updated_by_id=current_user.id
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

@router.get("/", response_model=List[schemas.FeePaymentOut])
def list_payments(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "id",
    order: str = "asc",
    term: Optional[schemas.FeeTerm] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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
