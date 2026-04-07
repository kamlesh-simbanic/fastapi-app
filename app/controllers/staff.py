from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas, utils


def add_staff(db: Session, staff_schema: schemas.StaffCreate, current_user_id: int):
    # Check if mobile or email already exists
    if (
        db.query(models.Staff)
        .filter(
            or_(
                models.Staff.mobile == staff_schema.mobile,
                models.Staff.email == staff_schema.email,
            )
        )
        .first()
    ):
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
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Staff
    new_staff = models.Staff(
        **staff_schema.model_dump(),
        user_id=new_user.id,
        created_by_id=current_user_id,
        updated_by_id=current_user_id,
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return new_staff


def list_staff(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "id",
    order: str = "asc",
    search: str | None = None,
    departments: list[str] | None = None,
):
    query = db.query(models.Staff)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Staff.name.ilike(search_filter))
            | (models.Staff.email.ilike(search_filter))
        )

    if departments and len(departments) > 0:
        query = query.filter(models.Staff.department.in_(departments))

    total = query.count()
    items = utils.apply_pagination_sort(
        query, models.Staff, skip, limit, sort_by, order
    ).all()

    return {"items": items, "total": total}


def get_staff(db: Session, staff_id: int):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff


def update_staff(
    db: Session, staff_id: int, staff_schema: schemas.StaffUpdate, current_user_id: int
):
    staff = get_staff(db, staff_id)
    user = db.query(models.User).filter(models.User.id == staff.user_id).first()

    update_data = staff_schema.model_dump(exclude_unset=True)

    # Check unique constraints if changed
    if "email" in update_data or "mobile" in update_data:
        email = update_data.get("email", staff.email)
        mobile = update_data.get("mobile", staff.mobile)

        existing = (
            db.query(models.Staff)
            .filter(
                (models.Staff.id != staff_id)
                & ((models.Staff.email == email) | (models.Staff.mobile == mobile))
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400, detail="Email or Mobile already exists"
            )

    # Update User if name/email/mobile changed
    if user:
        if "name" in update_data:
            user.name = update_data["name"]
        if "email" in update_data:
            user.email = update_data["email"]
        if "mobile" in update_data:
            user.mobile = update_data["mobile"]

    # Update Staff
    for key, value in update_data.items():
        setattr(staff, key, value)

    staff.updated_by_id = current_user_id
    staff.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(staff)
    return staff
