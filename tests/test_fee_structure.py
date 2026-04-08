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
def test_class(db_session, admin_user):
    school_class = db_session.query(models.SchoolClass).first()
    if not school_class:
        school_class = models.SchoolClass(
            standard="10th",
            division="A",
            created_by_id=admin_user.id,
            updated_by_id=admin_user.id
        )
        db_session.add(school_class)
        db_session.commit()
        db_session.refresh(school_class)
    return school_class

@pytest.mark.asyncio
async def test_create_fee_structure(client, auth_headers, test_class):
    fee_data = {
        "class_id": test_class.id,
        "year": 2025,
        "fee_amount": 1500.0
    }
    response = await client.post("/api/fee-structure/", json=fee_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["class_id"] == test_class.id
    assert data["year"] == 2025
    assert data["fee_amount"] == 1500.0

@pytest.mark.asyncio
async def test_create_duplicate_fee_structure(client, auth_headers, test_class):
    fee_data = {
        "class_id": test_class.id,
        "year": 2026,
        "fee_amount": 2000.0
    }
    # First creation
    await client.post("/api/fee-structure/", json=fee_data, headers=auth_headers)
    
    # Duplicate creation
    response = await client.post("/api/fee-structure/", json=fee_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_fee_structures(client, auth_headers):
    response = await client.get("/api/fee-structure/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_update_fee_structure(client, auth_headers, db_session):
    fee = db_session.query(models.FeeStructure).first()
    update_data = {
        "fee_amount": 1800.0
    }
    response = await client.put(f"/api/fee-structure/{fee.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["fee_amount"] == 1800.0

@pytest.mark.asyncio
async def test_delete_fee_structure(client, auth_headers, db_session):
    admin = db_session.query(models.User).filter(models.User.email == "admin@test.com").first()
    school_class = db_session.query(models.SchoolClass).first()
    
    fee = models.FeeStructure(
        class_id=school_class.id,
        year=2030,
        fee_amount=1000.0,
        created_by_id=admin.id,
        updated_by_id=admin.id
    )
    db_session.add(fee)
    db_session.commit()
    db_session.refresh(fee)

    response = await client.delete(f"/api/fee-structure/{fee.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Fee structure deleted"

    # Verify deletion
    deleted_fee = db_session.query(models.FeeStructure).filter(models.FeeStructure.id == fee.id).first()
    assert deleted_fee is None
