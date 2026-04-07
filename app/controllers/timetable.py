from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.school_class import SchoolClass
from app.models.timetable import Timetable


def get_class_timetable_data(db: Session, class_id: int):
    # Check if class exists
    school_class = db.query(SchoolClass).filter(SchoolClass.id == class_id).first()
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")

    # Get all timetable records for this class
    # Join with subject and teacher for direct access in Pydantic models
    timetable_records = db.query(Timetable).filter(Timetable.class_id == class_id).all()

    return {
        "class_id": school_class.id,
        "standard": school_class.standard,
        "division": school_class.division,
        "schedule": timetable_records,
    }
