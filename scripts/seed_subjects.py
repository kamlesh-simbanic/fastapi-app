import sys
import os
import random

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.models.subject import Subject, TeacherSubject
from app.models.staff import Staff, Department
from app.models.user import User

def seed_subjects():
    db = SessionLocal()
    try:
        # 1. Fetch an admin user to be the creator
        admin_user = db.query(User).first()
        if not admin_user:
            print("Error: No users found in the database. Please create a user first.")
            return

        creator_id = admin_user.id

        # 2. Fetch all teaching staff
        teachers = db.query(Staff).filter(Staff.department == Department.TEACHING).all()
        if len(teachers) < 2:
            print(f"Error: Not enough teaching staff found (found {len(teachers)}). Need at least 2.")
            return

        # 3. Define 10 Indian context subjects
        subject_names = [
            "Mathematics",
            "Hindi",
            "English",
            "Science",
            "Social Studies",
            "Sanskrit",
            "Computer Science",
            "Physical Education",
            "Art and Craft",
            "Geography"
        ]

        print(f"Starting seeding of {len(subject_names)} subjects...")

        for name in subject_names:
            # Check if subject already exists
            existing_subject = db.query(Subject).filter(Subject.name == name).first()
            if existing_subject:
                print(f"Subject '{name}' already exists. Skipping creation but will check teachers.")
                subject = existing_subject
            else:
                subject = Subject(
                    name=name,
                    created_by_id=creator_id,
                    updated_by_id=creator_id
                )
                db.add(subject)
                db.flush()  # To get the ID
                print(f"Created subject: {name}")

            # 4. Assign at least 2 random teachers to each subject
            current_teacher_ids = [ts.teacher_id for ts in subject.teachers]
            
            # Select 2 to 4 random teachers
            num_to_assign = random.randint(2, min(4, len(teachers)))
            selected_teachers = random.sample(teachers, num_to_assign)

            for teacher in selected_teachers:
                if teacher.id not in current_teacher_ids:
                    ts = TeacherSubject(
                        subject_id=subject.id,
                        teacher_id=teacher.id,
                        created_by_id=creator_id,
                        updated_by_id=creator_id
                    )
                    db.add(ts)
                    print(f"  Assigned teacher '{teacher.name}' to '{name}'")
        
        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_subjects()
