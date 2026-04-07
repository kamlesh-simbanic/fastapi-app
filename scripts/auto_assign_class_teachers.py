import os
import sys

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.school_class import SchoolClass
from app.models.staff import Staff


def auto_assign():
    db: Session = SessionLocal()
    try:
        # Get all classes ordered by standard and division
        classes = (
            db.query(SchoolClass)
            .order_by(SchoolClass.standard, SchoolClass.division)
            .all()
        )
        # Get all teaching staff
        staff_members = db.query(Staff).filter(Staff.department == "teaching").all()

        if not classes:
            print("No classes found in database.")
            return

        if len(staff_members) < len(classes):
            print(
                f"Warning: Only {len(staff_members)} staff members available for {len(classes)} classes."
            )

        print(f"Assigning teachers to {len(classes)} classes...")

        for i, school_class in enumerate(classes):
            if i < len(staff_members):
                teacher = staff_members[i]
                school_class.class_teacher_id = teacher.id
                print(
                    f"Assigned {teacher.name} to Standard {school_class.standard} - {school_class.division}"
                )
            else:
                print(
                    f"Warning: No teacher available for Standard {school_class.standard} - {school_class.division}"
                )

        db.commit()
        print("\nAll assignments committed successfully.")
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    auto_assign()
