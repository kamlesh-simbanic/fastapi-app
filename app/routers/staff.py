from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db
from app.schemas import StaffList

from .auth import check_access, get_current_user

router = APIRouter(
    prefix="/staff",
    tags=["staff"],
    dependencies=[Depends(check_access([models.Department.ADMIN]))],
)


@router.post("/", response_model=schemas.StaffOut, status_code=status.HTTP_201_CREATED)
def add_staff(
    staff: schemas.StaffCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.staff.add_staff(db, staff, current_user.id)


@router.get("/", response_model=StaffList)
def list_staff(
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "id",
    order: str = "asc",
    search: str | None = None,
    department: list[str] | None = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.staff.list_staff(
        db, skip, limit, sort_by, order, search, department
    )


@router.get("/{staff_id}", response_model=schemas.StaffOut)
def view_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.staff.get_staff(db, staff_id)


@router.put("/{staff_id}", response_model=schemas.StaffOut)
def update_staff(
    staff_id: int,
    staff: schemas.StaffUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.staff.update_staff(db, staff_id, staff, current_user.id)
