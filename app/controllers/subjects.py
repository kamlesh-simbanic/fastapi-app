from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models import Subject, TeacherSubject, Staff
from ..schemas import SubjectCreate, SubjectUpdate, TeacherSubjectCreate

def get_subjects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Subject).offset(skip).limit(limit).all()

def create_subject(db: Session, subject: SubjectCreate, user_id: int):
    # Check if subject already exists
    db_subject = db.query(Subject).filter(Subject.name == subject.name).first()
    if db_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject already registered"
        )
    
    new_subject = Subject(
        **subject.model_dump(),
        created_by_id=user_id,
        updated_by_id=user_id
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject

def update_subject(db: Session, subject_id: int, subject: SubjectUpdate, user_id: int):
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    update_data = subject.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)
    
    db_subject.updated_by_id = user_id
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db.delete(db_subject)
    db.commit()
    return {"message": "Subject deleted successfully"}

# Teacher Subject Assignment
def assign_teacher_to_subject(db: Session, assignment: TeacherSubjectCreate, user_id: int):
    # Check if subject exists
    if not db.query(Subject).filter(Subject.id == assignment.subject_id).first():
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if teacher exists
    if not db.query(Staff).filter(Staff.id == assignment.teacher_id).first():
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Check if already assigned
    existing = db.query(TeacherSubject).filter(
        TeacherSubject.subject_id == assignment.subject_id,
        TeacherSubject.teacher_id == assignment.teacher_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher already assigned to this subject"
        )
    
    new_assignment = TeacherSubject(
        **assignment.model_dump(),
        created_by_id=user_id,
        updated_by_id=user_id
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

def get_teacher_subjects(db: Session, teacher_id: int):
    return db.query(TeacherSubject).filter(TeacherSubject.teacher_id == teacher_id).all()

def get_subject_assignments(db: Session, subject_id: int):
    return db.query(TeacherSubject).filter(TeacherSubject.subject_id == subject_id).all()

def remove_teacher_from_subject(db: Session, assignment_id: int):
    db_assignment = db.query(TeacherSubject).filter(TeacherSubject.id == assignment_id).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(db_assignment)
    db.commit()
    return {"message": "Teacher removed from subject successfully"}
