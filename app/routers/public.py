from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/public",
    tags=["public"]
)

@router.get("/student/{gr_no}", response_model=schemas.StudentOut)
def get_student_by_gr_no(gr_no: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.gr_no == gr_no,
        models.Student.status == models.StudentStatus.ACTIVE
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active student found with GR No. {gr_no}"
        )
    
    return student
