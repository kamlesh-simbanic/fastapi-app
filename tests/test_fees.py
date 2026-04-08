import pytest
from app import models, utils
from tests.conftest import TestingSessionLocal
from datetime import date

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def admin_user(db_session):
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

@pytest.fixture
def test_setup(db_session, admin_user):
    # 1. Create Class
    school_class = db_session.query(models.SchoolClass).filter(models.SchoolClass.standard == "12th").first()
    if not school_class:
        school_class = models.SchoolClass(
            standard="12th",
            division="Z",
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id
        )
        db_session.add(school_class)
        db_session.commit()
        db_session.refresh(school_class)
    
    # 2. Create Student
    student = db_session.query(models.Student).filter(models.Student.gr_no == "GR1001").first()
    if not student:
        student = models.Student(
            gr_no="GR1001",
            name="John",
            father_name="Senior Doe",
            surname="Doe",
            mobile="9876543210",
            dob=date(2010, 5, 20),
            status=models.StudentStatus.ACTIVE
        )
        db_session.add(student)
        db_session.commit()
        db_session.refresh(student)

    # 3. Assign Student to Class
    mapping = db_session.query(models.ClassStudent).filter(
        models.ClassStudent.class_id == school_class.id,
        models.ClassStudent.academic_year == "2025-26"
    ).first()
    if not mapping:
        mapping = models.ClassStudent(
            class_id=school_class.id,
            academic_year="2025-26",
            students=[student.id],
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id
        )
        db_session.add(mapping)
        db_session.commit()
    
    # 4. Create Fee Structure
    fee_struct = db_session.query(models.FeeStructure).filter(
        models.FeeStructure.class_id == school_class.id,
        models.FeeStructure.year == 2025
    ).first()
    if not fee_struct:
        fee_struct = models.FeeStructure(
            class_id=school_class.id,
            year=2025,
            fee_amount=5000.0,
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id
        )
        db_session.add(fee_struct)
        db_session.commit()

    return {"student": student, "class": school_class, "year": 2025}

@pytest.mark.asyncio
async def test_get_suggested_fee(client, auth_headers, test_setup):
    gr_no = test_setup["student"].gr_no
    year = test_setup["year"]
    response = await client.get(f"/api/fees/suggested-amount/{gr_no}/{year}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["fee_amount"] == 5000.0

@pytest.mark.asyncio
async def test_add_fee_payment(client, auth_headers, test_setup):
    payment_data = {
        "gr_no": test_setup["student"].gr_no,
        "student_id": test_setup["student"].id,
        "term": "summer",
        "year": 2025,
        "amount": 5000.0,
        "payment_method": "upi",
        "payment_details": "TXN123456"
    }
    response = await client.post("/api/fees/", json=payment_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 5000.0
    assert data["payment_method"] == "upi"
    assert data["gr_no"] == test_setup["student"].gr_no

@pytest.mark.asyncio
async def test_list_payments(client, auth_headers, test_setup):
    response = await client.get("/api/fees/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_add_payment_invalid_student(client, auth_headers):
    # Valid Pydantic object but non-existent student ID in DB
    payment_data = {
        "gr_no": "NONEXISTENT",
        "student_id": 99999,
        "term": "winter",
        "year": 2025,
        "amount": 1000.0,
        "payment_method": "cash"
    }
    response = await client.post("/api/fees/", json=payment_data, headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Student not found"
