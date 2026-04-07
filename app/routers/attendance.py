from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db

from .auth import check_access, get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    dependencies=[Depends(check_access([models.Department.TEACHING]))],
)


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def add_attendance_bulk_new(
    data: schemas.AttendanceBulkCreateNew,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.attendance.add_attendance_bulk_new(db, data, current_user.id)


@router.get("/", response_model=list[schemas.AttendanceOut])
def view_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    sort_by: str = "date",
    order: str = "desc",
    class_id: int | None = None,
    day: date | None = None,
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.attendance.view_attendance(
        db, skip, limit, sort_by, order, class_id, day, month, year
    )


@router.get("/report/monthly", response_model=list[schemas.StudentAttendanceReport])
def view_monthly_attendance_report(
    month: int,
    year: int,
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.attendance.view_monthly_attendance_report(
        db, month, year, class_id
    )


@router.get("/report/monthly/pdf")
def view_monthly_attendance_report_pdf(
    month: int,
    year: int,
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi.responses import StreamingResponse

    pdf_buffer = controllers.attendance.generate_monthly_attendance_pdf(
        db, month, year, class_id
    )
    filename = f"Attendance_Report_{month}_{year}_{class_id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
