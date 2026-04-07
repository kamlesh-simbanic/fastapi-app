from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import timetable as timetable_controller
from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas.timetable import ClassTimetableResponse

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.get("/{class_id}", response_model=ClassTimetableResponse)
def get_class_timetable(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return timetable_controller.get_class_timetable_data(db, class_id)
