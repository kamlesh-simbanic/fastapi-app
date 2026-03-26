from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from .. import models, schemas, utils, controllers
from ..database import get_db
from .auth import get_current_user,  check_access

router = APIRouter(
    prefix="/staff",
    tags=["staff"],
    dependencies=[Depends(check_access([models.Department.ADMIN]))]
)

@router.post("/", response_model=schemas.StaffOut, status_code=status.HTTP_201_CREATED)
def add_staff(
    staff: schemas.StaffCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.staff.add_staff(db, staff, current_user.id)

@router.get("/", response_model=List[schemas.StaffOut])
def list_staff(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "id",
    order: str = "asc",
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.staff.list_staff(db, skip, limit, sort_by, order, search)

@router.get("/{staff_id}", response_model=schemas.StaffOut)
def view_staff(
    staff_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.staff.get_staff(db, staff_id)
