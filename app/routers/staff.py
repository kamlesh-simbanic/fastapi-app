from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from .. import models, schemas, utils
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/staff",
    tags=["staff"]
)

@router.post("/", response_model=schemas.StaffOut, status_code=status.HTTP_201_CREATED)
def add_staff(
    staff: schemas.StaffCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Check if mobile or email already exists
    if db.query(models.Staff).filter(or_(models.Staff.mobile == staff.mobile, models.Staff.email == staff.email)).first():
        raise HTTPException(status_code=400, detail="Mobile or Email already exists")

    # Generate password
    dept_code = staff.department.value[:4].upper()
    last_4_mobile = staff.mobile[-4:]
    dob_year = str(staff.dob.year)
    common_password = f"{dept_code}{last_4_mobile}{dob_year}"
    hashed_password = utils.get_password_hash(common_password)

    # Create User
    new_user = models.User(
        name=staff.name,
        email=staff.email,
        mobile=staff.mobile,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Staff
    new_staff = models.Staff(
        **staff.model_dump(),
        user_id=new_user.id,
        created_by_id=current_user.id,
        updated_by_id=current_user.id
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return new_staff

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
    query = db.query(models.Staff)
    
    if search:
        query = query.filter(
            or_(
                models.Staff.name.ilike(f"%{search}%"),
                models.Staff.email.ilike(f"%{search}%")
            )
        )

    return utils.apply_pagination_sort(query, models.Staff, skip, limit, sort_by, order).all()

@router.get("/{staff_id}", response_model=schemas.StaffOut)
def view_staff(
    staff_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff
