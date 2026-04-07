from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db

from .auth import check_access, get_current_user

router = APIRouter(
    prefix="/fees",
    tags=["fees"],
    dependencies=[
        Depends(check_access([models.Department.MANAGEMENT, models.Department.ADMIN]))
    ],
)


@router.post(
    "/", response_model=schemas.FeePaymentOut, status_code=status.HTTP_201_CREATED
)
def add_payment(
    payment: schemas.FeePaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.fees.add_payment(db, payment, current_user.id)


@router.get("/", response_model=list[schemas.FeePaymentOut])
def list_payments(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "id",
    order: str = "asc",
    term: schemas.FeeTerm | None = None,
    year: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.fees.list_payments(
        db, skip, limit, sort_by, order, term, year, search
    )


@router.get("/suggested-amount/{gr_no}/{year}")
def get_suggested_amount(
    gr_no: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.fees.get_suggested_fee(db, gr_no, year)
