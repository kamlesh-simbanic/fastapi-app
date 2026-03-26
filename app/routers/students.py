from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas, utils
from ..database import get_db
from .auth import get_current_user, check_access
from sqlalchemy import or_

router = APIRouter(
    prefix="/students",
    tags=["students"],
    dependencies=[Depends(check_access([models.Department.ADMIN, models.Department.TEACHING, models.Department.MANAGEMENT]))]
)

@router.post("/", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_year = datetime.now().year
    prefix = f"GR-{current_year}-"
    
    # Get the latest student for the current year
    last_student = db.query(models.Student).filter(models.Student.gr_no.like(f"{prefix}%")).order_by(models.Student.id.desc()).first()
    
    if last_student:
        # Extract the last 4 digits and increment
        try:
            last_serial = int(last_student.gr_no.split("-")[-1])
            new_serial = last_serial + 1
        except (ValueError, IndexError):
            new_serial = 1
    else:
        new_serial = 1
        
    gr_no = f"{prefix}{new_serial:04d}"

    new_student = models.Student(
        gr_no=gr_no,
        **student.model_dump()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("/", response_model=List[schemas.StudentOut])
def get_students(
    skip: int = 0, 
    limit: int = 100, 
    sort_by: str = "id", 
    order: str = "asc",
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # query = db.query(models.Student).filter(models.Student.status == models.StudentStatus.ACTIVE)
    query = db.query(models.Student)
    
    
    # Filtering
    if search:
        query = query.filter(
            or_(
                models.Student.name.ilike(f"%{search}%"),
                models.Student.surname.ilike(f"%{search}%")
            )
        )
    
    # Pagination & Sorting using utility
    return utils.apply_pagination_sort(query, models.Student, skip, limit, sort_by, order).all()

@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=schemas.StudentOut)
def update_student(student_id: int, student_update: schemas.StudentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    student_query = db.query(models.Student).filter(models.Student.id == student_id)
    student = student_query.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    student_query.update(student_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    student_query = db.query(models.Student).filter(models.Student.id == student_id)
    student = student_query.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    # Soft delete: change status to Terminated
    student_query.update({"status": models.StudentStatus.TERMINATED}, synchronize_session=False)
    db.commit()
    return None
