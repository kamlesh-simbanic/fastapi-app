import pytest
from datetime import date, datetime
from app import models, utils
from tests.conftest import TestingSessionLocal

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def teacher_user(db_session):
    # Create or get user
    user = db_session.query(models.User).filter(models.User.email == "teacher@test.com").first()
    if not user:
        user = models.User(
            name="Teacher User",
            email="teacher@test.com",
            mobile="9988776655",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    
    # Create or get staff record
    staff = db_session.query(models.Staff).filter(models.Staff.user_id == user.id).first()
    if not staff:
        staff = models.Staff(
            name="Teacher User",
            email="teacher@test.com",
            mobile="9988776655",
            dob=date(1985, 5, 20),
            department=models.Department.TEACHING,
            qualification="MA B.Ed",
            address="Teacher Colony",
            city="Mumbai",
            zip_code="400002",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
        db_session.refresh(staff)
    
    return user

@pytest.fixture
def auth_headers(teacher_user):
    token = utils.create_access_token(data={"sub": teacher_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_class(db_session):
    school_class = db_session.query(models.SchoolClass).filter(
        models.SchoolClass.standard == "10",
        models.SchoolClass.division == "A"
    ).first()
    if not school_class:
        school_class = models.SchoolClass(
            standard="10",
            division="A"
        )
        db_session.add(school_class)
        db_session.commit()
        db_session.refresh(school_class)
    return school_class

@pytest.fixture
def test_students(db_session, test_class):
    students = []
    for i in range(1, 4):
        gr_no = f"GR-ATT-{i:04}"
        student = db_session.query(models.Student).filter(models.Student.gr_no == gr_no).first()
        if not student:
            student = models.Student(
                gr_no=gr_no,
                name=f"Student {i}",
                father_name="Father",
                surname="Attendance",
                mobile=f"123456789{i}",
                dob=date(2010, 1, i),
                status=models.StudentStatus.ACTIVE
            )
            db_session.add(student)
            db_session.commit()
            db_session.refresh(student)
        students.append(student)
    
    # Map to class
    mapping = db_session.query(models.ClassStudent).filter(models.ClassStudent.class_id == test_class.id).first()
    if not mapping:
        mapping = models.ClassStudent(
            class_id=test_class.id,
            students=[s.id for s in students]
        )
        db_session.add(mapping)
    else:
        mapping.students = [s.id for s in students]
    db_session.commit()
    
    return students

@pytest.mark.asyncio
async def test_mark_attendance_bulk(client, auth_headers, test_class, test_students):
    today = date.today().isoformat()
    attendance_data = {
        "class_id": test_class.id,
        "date": today,
        "records": [
            {"student_id": s.id, "status": "P" if s.id % 2 == 1 else "A"}
            for s in test_students
        ]
    }
    
    response = await client.post("/api/attendance/bulk", json=attendance_data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["detail"] == "Attendance recorded successfully"

@pytest.mark.asyncio
async def test_update_attendance_bulk(client, auth_headers, test_class, test_students):
    today = date.today().isoformat()
    # Initial mark (already done in previous test if run in order, but we should be isolated)
    attendance_data = {
        "class_id": test_class.id,
        "date": today,
        "records": [{"student_id": s.id, "status": "P"} for s in test_students]
    }
    await client.post("/api/attendance/bulk", json=attendance_data, headers=auth_headers)
    
    # Update to all Absent
    update_data = {
        "class_id": test_class.id,
        "date": today,
        "records": [{"student_id": s.id, "status": "A"} for s in test_students]
    }
    response = await client.post("/api/attendance/bulk", json=update_data, headers=auth_headers)
    assert response.status_code == 201
    
    # Verify via list
    list_response = await client.get(f"/api/attendance/?class_id={test_class.id}&day={today}", headers=auth_headers)
    assert list_response.status_code == 200
    records = list_response.json()
    assert len(records) == 1
    assert all(r["status"] == "A" for r in records[0]["records"])

@pytest.mark.asyncio
async def test_view_attendance_filters(client, auth_headers, test_class):
    # Already created records in previous tests
    response = await client.get(f"/api/attendance/?class_id={test_class.id}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_monthly_report(client, auth_headers, test_class, test_students):
    today = date.today()
    month = today.month
    year = today.year
    
    response = await client.get(
        f"/api/attendance/report/monthly?month={month}&year={year}&class_id={test_class.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(test_students)
    assert "attendance_percentage" in data[0]

@pytest.mark.asyncio
async def test_monthly_report_pdf(client, auth_headers, test_class):
    today = date.today()
    month = today.month
    year = today.year
    
    response = await client.get(
        f"/api/attendance/report/monthly/pdf?month={month}&year={year}&class_id={test_class.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

@pytest.mark.asyncio
async def test_attendance_unauthorized(client):
    response = await client.get("/api/attendance/")
    assert response.status_code == 401
