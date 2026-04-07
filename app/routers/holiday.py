from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db

from .auth import check_access, get_current_user

router = APIRouter(
    prefix="/holidays",
    tags=["Holidays"],
    dependencies=[Depends(check_access([models.Department.ADMIN]))],
)


@router.post(
    "/", response_model=schemas.HolidayOut, status_code=status.HTTP_201_CREATED
)
def create_holiday(
    holiday: schemas.HolidayCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.holiday.create_holiday(db, holiday, current_user.id)


@router.get("/", response_model=list[schemas.HolidayOut])
def get_holidays(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    sort_by: str = "date",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.holiday.get_holidays(db, skip, limit, sort_by, order)


@router.get("/{holiday_id}", response_model=schemas.HolidayOut)
def get_holiday(
    holiday_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.holiday.get_holiday(db, holiday_id)


@router.put("/{holiday_id}", response_model=schemas.HolidayOut)
def update_holiday(
    holiday_id: int,
    holiday_update: schemas.HolidayUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.holiday.update_holiday(
        db, holiday_id, holiday_update, current_user.id
    )


@router.delete("/{holiday_id}")
def delete_holiday(
    holiday_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.holiday.delete_holiday(db, holiday_id)
