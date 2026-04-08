import pytest
from app import models, utils
from tests.conftest import TestingSessionLocal
from datetime import date, timedelta

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def admin_user(db_session):
    user = db_session.query(models.User).filter(models.User.email == "holiday_admin@test.com").first()
    if not user:
        user = models.User(
            name="Holiday Admin",
            email="holiday_admin@test.com",
            mobile="1234567891",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    
    # Associate with staff for access control check if needed (though admin dept is usually on staff)
    staff = db_session.query(models.Staff).filter(models.Staff.user_id == user.id).first()
    if not staff:
        staff = models.Staff(
            name="Holiday Admin",
            email="holiday_admin@test.com",
            mobile="1234567891",
            dob=date(1985, 5, 5),
            department="admin",
            qualification="MBA",
            address="Admin St",
            city="Admin City",
            zip_code="11111",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
    
    return user

@pytest.fixture
def teacher_user(db_session):
    user = db_session.query(models.User).filter(models.User.email == "holiday_teacher@test.com").first()
    if not user:
        user = models.User(
            name="Holiday Teacher",
            email="holiday_teacher@test.com",
            mobile="1234567892",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    
    staff = db_session.query(models.Staff).filter(models.Staff.user_id == user.id).first()
    if not staff:
        staff = models.Staff(
            name="Holiday Teacher",
            email="holiday_teacher@test.com",
            mobile="1234567892",
            dob=date(1990, 10, 10),
            department="teaching",
            qualification="B.Ed",
            address="Teacher Ave",
            city="Teacher Town",
            zip_code="22222",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
    
    return user

@pytest.fixture
def admin_headers(admin_user):
    token = utils.create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def teacher_headers(teacher_user):
    token = utils.create_access_token(data={"sub": teacher_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_holiday(client, admin_headers):
    holiday_date = (date.today() + timedelta(days=20)).isoformat()
    resp = await client.post(
        "/api/holidays/",
        json={
            "name": "Winter Vacation",
            "date": holiday_date,
            "number_of_days": 10
        },
        headers=admin_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Winter Vacation"
    assert data["number_of_days"] == 10

@pytest.mark.asyncio
async def test_get_holidays(client, admin_headers):
    resp = await client.get("/api/holidays/", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_update_holiday(client, admin_headers, db_session):
    holiday = db_session.query(models.Holiday).filter(models.Holiday.name == "Winter Vacation").first()
    resp = await client.put(
        f"/api/holidays/{holiday.id}",
        json={"name": "Christmas Break"},
        headers=admin_headers
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Christmas Break"

@pytest.mark.asyncio
async def test_delete_holiday(client, admin_headers, db_session):
    holiday = db_session.query(models.Holiday).filter(models.Holiday.name == "Christmas Break").first()
    resp = await client.delete(f"/api/holidays/{holiday.id}", headers=admin_headers)
    assert resp.status_code == 200
    
    # Verify deletion
    resp = await client.get(f"/api/holidays/{holiday.id}", headers=admin_headers)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_holiday_access_control(client, teacher_headers):
    resp = await client.post(
        "/api/holidays/",
        json={
            "name": "Unauthorized Holiday",
            "date": date.today().isoformat(),
            "number_of_days": 1
        },
        headers=teacher_headers
    )
    # router has Depends(check_access([models.Department.ADMIN]))
    assert resp.status_code == 403
