from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db

from .auth import get_current_user

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/", response_model=list[schemas.Subject])
def list_subjects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.get_subjects(db, skip, limit)


@router.post("/", response_model=schemas.Subject, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.create_subject(db, subject, current_user.id)


@router.put("/{subject_id}", response_model=schemas.Subject)
def update_subject(
    subject_id: int,
    subject: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.update_subject(db, subject_id, subject, current_user.id)


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.delete_subject(db, subject_id)


# Teacher Subject Assignment
@router.post(
    "/assign",
    response_model=schemas.TeacherSubject,
    status_code=status.HTTP_201_CREATED,
)
def assign_teacher(
    assignment: schemas.TeacherSubjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.assign_teacher_to_subject(
        db, assignment, current_user.id
    )


@router.get("/teacher/{teacher_id}", response_model=list[schemas.TeacherSubject])
def get_teacher_assignments(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.get_teacher_subjects(db, teacher_id)


@router.get("/{subject_id}/teachers", response_model=list[schemas.TeacherSubject])
def get_subject_assignments(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.get_subject_assignments(db, subject_id)


@router.delete("/assign/{assignment_id}")
def unassign_teacher(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.subjects.remove_teacher_from_subject(db, assignment_id)
