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
    user = db_session.query(models.User).filter(models.User.email == "subject_admin@test.com").first()
    if not user:
        user = models.User(
            name="Subject Admin",
            email="subject_admin@test.com",
            mobile="9999999991",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def teacher_staff(db_session, admin_user):
    # Register a teacher user
    user = db_session.query(models.User).filter(models.User.email == "subject_teacher@test.com").first()
    if not user:
        user = models.User(
            name="Math Teacher",
            email="subject_teacher@test.com",
            mobile="9999999992",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    # Register as staff
    staff = db_session.query(models.Staff).filter(models.Staff.user_id == user.id).first()
    if not staff:
        staff = models.Staff(
            name="Math Teacher",
            email="subject_teacher@test.com",
            mobile="9999999992",
            dob=date(1990, 1, 1),
            department="teaching",
            qualification="M.Sc Math",
            address="Teacher St",
            city="Pune",
            zip_code="411001",
            user_id=user.id
        )
        db_session.add(staff)
        db_session.commit()
    return staff

@pytest.fixture
def auth_headers(admin_user):
    token = utils.create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_subject(client, auth_headers):
    resp = await client.post(
        "/api/subjects/",
        json={"name": "Mathematics"},
        headers=auth_headers
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Mathematics"

@pytest.mark.asyncio
async def test_create_duplicate_subject(client, auth_headers):
    # Pre-create
    await client.post("/api/subjects/", json={"name": "Science"}, headers=auth_headers)
    
    # Duplicate
    resp = await client.post("/api/subjects/", json={"name": "Science"}, headers=auth_headers)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_list_subjects(client, auth_headers):
    resp = await client.get("/api/subjects/", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 2

@pytest.mark.asyncio
async def test_update_subject(client, auth_headers, db_session):
    subject = db_session.query(models.Subject).filter(models.Subject.name == "Mathematics").first()
    resp = await client.put(
        f"/api/subjects/{subject.id}",
        json={"name": "Advanced Math"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Advanced Math"

@pytest.mark.asyncio
async def test_assign_teacher_to_subject(client, auth_headers, db_session, teacher_staff):
    subject = db_session.query(models.Subject).first()
    resp = await client.post(
        "/api/subjects/assign",
        json={
            "subject_id": subject.id,
            "teacher_id": teacher_staff.id
        },
        headers=auth_headers
    )
    assert resp.status_code == 201
    assert resp.json()["subject_id"] == subject.id
    assert resp.json()["teacher_id"] == teacher_staff.id

@pytest.mark.asyncio
async def test_assign_teacher_duplicate(client, auth_headers, db_session, teacher_staff):
    subject = db_session.query(models.Subject).first()
    # Duplicate assign
    resp = await client.post(
        "/api/subjects/assign",
        json={
            "subject_id": subject.id,
            "teacher_id": teacher_staff.id
        },
        headers=auth_headers
    )
    assert resp.status_code == 400
    assert "already assigned" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_get_subject_assignments(client, auth_headers, db_session):
    subject = db_session.query(models.Subject).first()
    resp = await client.get(f"/api/subjects/{subject.id}/teachers", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["subject_id"] == subject.id

@pytest.mark.asyncio
async def test_remove_teacher_from_subject(client, auth_headers, db_session):
    assignment = db_session.query(models.TeacherSubject).first()
    resp = await client.delete(f"/api/subjects/assign/{assignment.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert "successfully" in resp.json()["message"]

@pytest.mark.asyncio
async def test_delete_subject(client, auth_headers, db_session):
    subject = db_session.query(models.Subject).filter(models.Subject.name == "Advanced Math").first()
    resp = await client.delete(f"/api/subjects/{subject.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert "successfully" in resp.json()["message"]
