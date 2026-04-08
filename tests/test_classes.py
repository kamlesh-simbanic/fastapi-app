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
    
    # Create staff record for the admin
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
async def test_create_class(client, auth_headers):
    class_data = {
        "standard": "10th",
        "division": "A",
        "class_teacher_id": None
    }
    response = await client.post("/api/classes/", json=class_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["standard"] == "10th"
    assert data["division"] == "A"

@pytest.mark.asyncio
async def test_create_duplicate_class(client, auth_headers):
    class_data = {
        "standard": "11th",
        "division": "B",
        "class_teacher_id": None
    }
    # First creation
    await client.post("/api/classes/", json=class_data, headers=auth_headers)
    
    # Second creation (duplicate)
    response = await client.post("/api/classes/", json=class_data, headers=auth_headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "Class already exists"

@pytest.mark.asyncio
async def test_list_classes(client, auth_headers, db_session):
    # Ensure there's at least one class
    school_class = db_session.query(models.SchoolClass).first()
    if not school_class:
        admin = db_session.query(models.User).filter(models.User.email == "admin@test.com").first()
        school_class = models.SchoolClass(
            standard="1st",
            division="C",
            created_by_id=admin.id,
            updated_by_id=admin.id
        )
        db_session.add(school_class)
        db_session.commit()

    response = await client.get("/api/classes/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1

@pytest.mark.asyncio
async def test_update_class(client, auth_headers, db_session):
    school_class = db_session.query(models.SchoolClass).first()
    update_data = {
        "standard": "2nd",
        "division": "D"
    }
    response = await client.put(f"/api/classes/{school_class.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["standard"] == "2nd"
    assert data["division"] == "D"

@pytest.mark.asyncio
async def test_delete_class(client, auth_headers, db_session):
    admin = db_session.query(models.User).filter(models.User.email == "admin@test.com").first()
    school_class = models.SchoolClass(
        standard="Cleanup",
        division="X",
        created_by_id=admin.id,
        updated_by_id=admin.id
    )
    db_session.add(school_class)
    db_session.commit()
    db_session.refresh(school_class)

    response = await client.delete(f"/api/classes/{school_class.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["detail"] == "Class deleted successfully"

    # Verify deletion
    deleted_class = db_session.query(models.SchoolClass).filter(models.SchoolClass.id == school_class.id).first()
    assert deleted_class is None
