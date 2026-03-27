from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas, utils, controllers
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
    return controllers.students.create_student(db, student)

@router.get("/", response_model=schemas.StudentList)
def get_students(
    skip: int = 0, 
    limit: int = 100, 
    sort_by: str = "id", 
    order: str = "asc",
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.students.get_students(db, skip, limit, sort_by, order, search)

@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.students.get_student(db, student_id)

@router.put("/{student_id}", response_model=schemas.StudentOut)
def update_student(student_id: int, student_update: schemas.StudentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.students.update_student(db, student_id, student_update)

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.students.delete_student(db, student_id)
