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
            department="admin", # Use string to avoid enum issues if not str-inherited
            qualification="PhD",
            address="Test Address",
            city="Test City",
            zip_code="12345",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
    
    return user

@pytest.fixture
def auth_headers(admin_user):
    token = utils.create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_add_staff(client, auth_headers):
    staff_data = {
        "name": "Jane Smith",
        "email": "jane@test.com",
        "mobile": "9876543211",
        "dob": "1995-05-15",
        "department": "management",
        "qualification": "B.Com",
        "address": "456 Oak St",
        "city": "Account City",
        "zip_code": "54321"
    }
    response = await client.post("/api/staff/", json=staff_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Smith"
    assert data["email"] == "jane@test.com"
    assert data["department"] == "management"

@pytest.mark.asyncio
async def test_add_staff_duplicate_email(client, auth_headers):
    staff_data = {
        "name": "Jane Duplicate",
        "email": "jane@test.com", # Already created in previous test
        "mobile": "9876543212",
        "dob": "1995-05-15",
        "department": "management",
        "qualification": "B.Com",
        "address": "456 Oak St",
        "city": "Account City",
        "zip_code": "54321"
    }
    response = await client.post("/api/staff/", json=staff_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_staff(client, auth_headers):
    response = await client.get("/api/staff/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 2 # Admin + Jane

@pytest.mark.asyncio
async def test_view_staff(client, auth_headers, db_session):
    staff = db_session.query(models.Staff).filter(models.Staff.email == "jane@test.com").first()
    response = await client.get(f"/api/staff/{staff.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Jane Smith"

@pytest.mark.asyncio
async def test_update_staff(client, auth_headers, db_session):
    staff = db_session.query(models.Staff).filter(models.Staff.email == "jane@test.com").first()
    update_data = {
        "name": "Jane Updated",
        "qualification": "M.Com"
    }
    response = await client.put(f"/api/staff/{staff.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Jane Updated"
    assert response.json()["qualification"] == "M.Com"
