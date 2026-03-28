from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas, utils, controllers
from ..database import get_db
from .auth import get_current_user, check_access

router = APIRouter(
    prefix="/class-students",
    tags=["Class Students"],
    dependencies=[Depends(check_access([models.Department.ADMIN, models.Department.MANAGEMENT]))]
)

@router.post("/", response_model=schemas.ClassStudent, status_code=status.HTTP_201_CREATED)
def create_class_student(
    student_schema: schemas.ClassStudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.class_student.add_class_student(db, student_schema, current_user.id)

@router.get("/", response_model=List[schemas.ClassStudent])
def read_class_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    sort_by: str = "id",
    order: str = "asc",
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.class_student.list_class_students(db, skip, limit, sort_by, order, academic_year)

@router.get("/{id}", response_model=schemas.ClassStudent)
def read_class_student(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.class_student.get_class_student(db, id)

@router.put("/{id}", response_model=schemas.ClassStudent)
def update_class_student(
    id: int,
    student_schema: schemas.ClassStudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.class_student.update_class_student(db, id, student_schema, current_user.id)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_class_student(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return controllers.class_student.delete_class_student(db, id)
