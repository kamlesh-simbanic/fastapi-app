import os
import random
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from app.database import SessionLocal
from app.models import Student, SchoolClass, ClassStudent, User

# Configuration
ADMIN_USER_ID = 1
ACADEMIC_YEAR = "2025-26"
STUDENTS_PER_CLASS = 50

def calculate_age(dob):
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def seed_class_assignments():
    db: Session = SessionLocal()
    
    try:
        print(f"Starting seeding for Academic Year: {ACADEMIC_YEAR}")
        
        # Mapping: Age -> Grade (5 -> 1, 6 -> 2, ..., 16 -> 12, 17 -> 12)
        # The user requested 17 -> 12 specifically.
        
        # Clear existing assignments for this academic year to avoid duplicates
        db.query(ClassStudent).filter(ClassStudent.academic_year == ACADEMIC_YEAR).delete()
        db.commit()

        # Fetch all students and group them by age
        all_students = db.query(Student).all()
        students_by_age = {}
        for s in all_students:
            age = calculate_age(s.dob)
            if age not in students_by_age:
                students_by_age[age] = []
            students_by_age[age].append(s.id)
        
        # Fetch all classes
        all_classes = db.query(SchoolClass).all()
        classes_by_grade = {}
        for c in all_classes:
            try:
                grade = int(c.standard) if c.standard.isdigit() else None
            except:
                grade = None
            if grade:
                if grade not in classes_by_grade:
                    classes_by_grade[grade] = {}
                classes_by_grade[grade][c.division] = c.id
        
        summary = []
        for age in range(5, 18):
            grade = min(12, age - 4)
            print(f"Processing Age {age} -> Grade {grade}")
            students = students_by_age.get(age, [])
            random.shuffle(students)
            
            divisions = ['A', 'B', 'C']
            grade_classes = classes_by_grade.get(grade, {})
            
            for i, div in enumerate(divisions):
                class_id = grade_classes.get(div)
                if not class_id:
                    print(f"  Warning: Class {grade}-{div} not found.")
                    continue
                
                # Take slice of students
                start_idx = i * STUDENTS_PER_CLASS
                end_idx = (i + 1) * STUDENTS_PER_CLASS
                assigned_students = students[start_idx:end_idx]
                
                if len(assigned_students) < STUDENTS_PER_CLASS:
                    print(f"  Warning: Only {len(assigned_students)} students available for {grade}-{div} (Target: {STUDENTS_PER_CLASS})")
                
                if assigned_students:
                    mapping = ClassStudent(
                        academic_year=ACADEMIC_YEAR,
                        class_id=class_id,
                        students=assigned_students,
                        created_by_id=ADMIN_USER_ID,
                        updated_by_id=ADMIN_USER_ID
                    )
                    db.add(mapping)
        
        db.commit()
        print("Data seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_class_assignments()


