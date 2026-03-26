from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import or_

from .. import models, schemas, utils

def add_staff(db: Session, staff_schema: schemas.StaffCreate, current_user_id: int):
    # Check if mobile or email already exists
    if db.query(models.Staff).filter(or_(models.Staff.mobile == staff_schema.mobile, models.Staff.email == staff_schema.email)).first():
        raise HTTPException(status_code=400, detail="Mobile or Email already exists")

    # Generate password
    dept_code = staff_schema.department.value[:4].upper()
    last_4_mobile = staff_schema.mobile[-4:]
    dob_year = str(staff_schema.dob.year)
    common_password = f"{dept_code}{last_4_mobile}{dob_year}"
    hashed_password = utils.get_password_hash(common_password)

    # Create User
    new_user = models.User(
        name=staff_schema.name,
        email=staff_schema.email,
        mobile=staff_schema.mobile,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Staff
    new_staff = models.Staff(
        **staff_schema.model_dump(),
        user_id=new_user.id,
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return new_staff

def list_staff(db: Session, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc", search: Optional[str] = None):
    query = db.query(models.Staff)
    
    if search:
        query = query.filter(
            or_(
                models.Staff.name.ilike(f"%{search}%"),
                models.Staff.email.ilike(f"%{search}%")
            )
        )

    return utils.apply_pagination_sort(query, models.Staff, skip, limit, sort_by, order).all()

def get_staff(db: Session, staff_id: int):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff
