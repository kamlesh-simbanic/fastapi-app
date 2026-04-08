import pytest
from datetime import date
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
def admin_user(db_session):
    # Create or get user
    user = db_session.query(models.User).filter(models.User.email == "admin@test.com").first()
    if not user:
        user = models.User(
            name="Admin User",
            email="admin@test.com",
            mobile="1234567890",
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
            name="Admin User",
            email="admin@test.com",
            mobile="1234567890",
            dob=date(1990, 1, 1),
            department=models.Department.ADMIN,
            qualification="PhD",
            address="Test Address",
            city="Test City",
            zip_code="12345",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
        db_session.refresh(staff)
    
    return user

@pytest.fixture
def auth_headers(admin_user):
    token = utils.create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_student(client, auth_headers):
    student_data = {
        "name": "John",
        "father_name": "Doe",
        "surname": "Smith",
        "mobile": "9876543210",
        "dob": "2010-05-15",
        "address": "123 School St",
        "city": "Mumbai",
        "zip_code": "400001",
        "status": "active" # This is fine for the API as it uses schemas.StudentStatus which matches "active"
    }
    response = await client.post("/api/students/", json=student_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == student_data["name"]
    assert "gr_no" in data
    assert data["gr_no"].startswith(f"GR-{date.today().year}-")

@pytest.mark.asyncio
async def test_get_students(client, auth_headers, db_session):
    # Ensure there's at least one student
    student = db_session.query(models.Student).first()
    if not student:
        student = models.Student(
            gr_no="GR-2026-0001",
            name="Alice",
            father_name="Bob",
            surname="Jones",
            mobile="1122334455",
            dob=date(2012, 8, 20),
            address="456 Park Ave",
            city="Pune",
            zip_code="411001",
            status=models.StudentStatus.ACTIVE
        )
        db_session.add(student)
        db_session.commit()

    response = await client.get("/api/students/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

@pytest.mark.asyncio
async def test_get_student_by_id(client, auth_headers, db_session):
    student = db_session.query(models.Student).first()
    if not student:
        student = models.Student(
            gr_no="GR-2026-0002",
            name="Alice",
            father_name="Bob",
            surname="Jones",
            mobile="1122334455",
            dob=date(2012, 8, 20),
            address="456 Park Ave",
            city="Pune",
            zip_code="411001",
            status=models.StudentStatus.ACTIVE
        )
        db_session.add(student)
        db_session.commit()
        db_session.refresh(student)

    response = await client.get(f"/api/students/{student.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == student.id
    assert data["name"] == student.name

@pytest.mark.asyncio
async def test_update_student(client, auth_headers, db_session):
    student = db_session.query(models.Student).first()
    if not student:
        student = models.Student(
            gr_no="GR-2026-0003",
            name="Alice",
            father_name="Bob",
            surname="Jones",
            mobile="1122334455",
            dob=date(2012, 8, 20),
            address="456 Park Ave",
            city="Pune",
            zip_code="411001",
            status=models.StudentStatus.ACTIVE
        )
        db_session.add(student)
        db_session.commit()
        db_session.refresh(student)

    update_data = {
        "name": "Updated John"
    }
    response = await client.put(f"/api/students/{student.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated John"

@pytest.mark.asyncio
async def test_delete_student(client, auth_headers, db_session):
    # Create a student to delete
    student = models.Student(
        gr_no="GR-2026-9999",
        name="Cleanup",
        father_name="Test",
        surname="User",
        mobile="0000000000",
        dob=date(2015, 1, 1),
        address="Delete St",
        city="Delete City",
        zip_code="000000",
        status=models.StudentStatus.ACTIVE
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    response = await client.delete(f"/api/students/{student.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify status is Terminated (soft delete)
    db_session.refresh(student)
    assert student.status == models.StudentStatus.TERMINATED

@pytest.mark.asyncio
async def test_unauthorized_access(client):
    response = await client.get("/api/students/")
    assert response.status_code == 401
