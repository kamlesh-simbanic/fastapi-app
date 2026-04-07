from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db

from .auth import get_current_user

router = APIRouter(prefix="/leave-requests", tags=["leave-requests"])


def get_current_staff(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    staff = (
        db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()
    )
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can access leave requests",
        )
    return staff


@router.post("/", response_model=schemas.LeaveRequestResponse)
def create_leave(
    obj_in: schemas.LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff),
):
    return controllers.leave_request.create_leave_request(
        db=db, obj_in=obj_in, staff_id=current_staff.id, user_id=current_staff.user_id
    )


@router.get("/", response_model=list[schemas.LeaveRequestResponse])
def list_leaves(
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff),
    view: str = "personal",  # "personal" or "approvals"
):
    if view == "approvals":
        return controllers.leave_request.get_leave_requests(
            db=db, approver_staff=current_staff
        )
    else:
        return controllers.leave_request.get_leave_requests(
            db=db, staff_id=current_staff.id
        )


@router.patch("/{leave_id}/status", response_model=schemas.LeaveRequestResponse)
def update_status(
    leave_id: int,
    obj_in: schemas.LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(get_current_staff),
):
    return controllers.leave_request.update_leave_status(
        db=db, leave_id=leave_id, obj_in=obj_in, approver_user_id=current_staff.user_id
    )
