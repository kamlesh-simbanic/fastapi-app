import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app import models, utils
    from app.database import SessionLocal, engine
except ImportError as e:
    print(f"Import Error: {e}")
    print(
        "Please run this script from the project root or ensure the PYTHONPATH is set correctly."
    )
    sys.exit(1)


def migrate_staff_to_users():
    db = SessionLocal()
    try:
        # Get all staff
        staff_list = db.query(models.Staff).all()
        print(f"Found {len(staff_list)} staff members.")

        users_created = 0
        staff_updated = 0

        for staff in staff_list:
            # Check if user already exists for this staff
            user = None
            if staff.user_id:
                user = (
                    db.query(models.User)
                    .filter(models.User.id == staff.user_id)
                    .first()
                )

            if not user:
                # Check by email or mobile if no user_id is linked
                user = (
                    db.query(models.User)
                    .filter(
                        (models.User.email == staff.email)
                        | (models.User.mobile == staff.mobile)
                    )
                    .first()
                )

            if not user:
                # Password logic (same as in app/controllers/staff.py)
                # dept_code[:4].upper() + mobile[-4:] + dob_year
                dept_code = (
                    staff.department.value[:4].upper() if staff.department else "STAF"
                )
                last_4_mobile = staff.mobile[-4:] if staff.mobile else "0000"
                dob_year = str(staff.dob.year) if staff.dob else "1990"

                common_password = f"{dept_code}{last_4_mobile}{dob_year}"
                hashed_password = utils.get_password_hash(common_password)

                print(
                    f"Creating user for {staff.name} (Email: {staff.email}, Mobile: {staff.mobile})"
                )

                user = models.User(
                    name=staff.name,
                    email=staff.email,
                    mobile=staff.mobile,
                    hashed_password=hashed_password,
                    is_active=True,
                )
                db.add(user)
                db.flush()  # Flush to get the ID for the new user
                users_created += 1

            # Check if staff record needs linking to the user
            if staff.user_id != user.id:
                staff.user_id = user.id
                staff_updated += 1
                print(
                    f"Linked staff {staff.name} (ID: {staff.id}) to user (ID: {user.id})"
                )

        db.commit()
        print("\nMigration Summary:")
        print(f"- Total Staff Processed: {len(staff_list)}")
        print(f"- New Users Created: {users_created}")
        print(f"- Staff Records Updated/Linked: {staff_updated}")
        print("\nMigration completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"\nError during migration: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting staff to user migration...")
    migrate_staff_to_users()
