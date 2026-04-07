from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    student_count = db.query(models.Student).count()
    staff_count = db.query(models.Staff).count()
    task_count = db.query(models.Task).count()

    # Calculate total fees collected (sum of amount)
    total_fees = db.query(func.sum(models.FeePayment.amount)).scalar() or 0

    return {
        "students": student_count,
        "staff": staff_count,
        "tasks": task_count,
        "total_fees": float(total_fees),
        "status": "success",
    }
