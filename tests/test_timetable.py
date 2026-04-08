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
def test_user(db_session):
    user = db_session.query(models.User).filter(models.User.email == "timetable_admin@test.com").first()
    if not user:
        user = models.User(
            name="Timetable Admin",
            email="timetable_admin@test.com",
            mobile="1122334455",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    token = utils.create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_data(db_session):
    # 1. Create Class
    school_class = db_session.query(models.SchoolClass).filter(
        models.SchoolClass.standard == "9",
        models.SchoolClass.division == "C"
    ).first()
    if not school_class:
        school_class = models.SchoolClass(standard="9", division="C")
        db_session.add(school_class)
        db_session.commit()
        db_session.refresh(school_class)

    # 2. Create Subject
    subject = db_session.query(models.Subject).filter(models.Subject.name == "Physics").first()
    if not subject:
        subject = models.Subject(name="Physics")
        db_session.add(subject)
        db_session.commit()
        db_session.refresh(subject)

    # 3. Create Teacher
    teacher_user = db_session.query(models.User).filter(models.User.email == "physics_teacher@test.com").first()
    if not teacher_user:
        teacher_user = models.User(
            name="Physics Teacher",
            email="physics_teacher@test.com",
            mobile="9090909090",
            hashed_password=utils.get_password_hash("password123"),
            is_active=True
        )
        db_session.add(teacher_user)
        db_session.commit()
        db_session.refresh(teacher_user)

    teacher = db_session.query(models.Staff).filter(models.Staff.user_id == teacher_user.id).first()
    if not teacher:
        teacher = models.Staff(
            name="Physics Teacher",
            email="physics_teacher@test.com",
            mobile="9090909090",
            department=models.Department.TEACHING,
            user_id=teacher_user.id
        )
        db_session.add(teacher)
        db_session.commit()
        db_session.refresh(teacher)

    # 4. Create Timetable record
    timetable_entry = db_session.query(models.Timetable).filter(
        models.Timetable.class_id == school_class.id,
        models.Timetable.day_of_week == "Monday",
        models.Timetable.period_number == 1
    ).first()
    if not timetable_entry:
        timetable_entry = models.Timetable(
            class_id=school_class.id,
            subject_id=subject.id,
            teacher_id=teacher.id,
            day_of_week="Monday",
            period_number=1
        )
        db_session.add(timetable_entry)
        db_session.commit()
        db_session.refresh(timetable_entry)

    return {
        "class": school_class,
        "subject": subject,
        "teacher": teacher,
        "entry": timetable_entry
    }

@pytest.mark.asyncio
async def test_get_timetable(client, auth_headers, test_data):
    class_id = test_data["class"].id
    response = await client.get(f"/api/timetable/{class_id}", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["class_id"] == class_id
    assert data["standard"] == "9"
    assert data["division"] == "C"
    assert len(data["schedule"]) >= 1
    
    entry = data["schedule"][0]
    assert entry["day_of_week"] == "Monday"
    assert entry["period_number"] == 1
    assert entry["subject"]["name"] == "Physics"
    assert entry["teacher"]["name"] == "Physics Teacher"

@pytest.mark.asyncio
async def test_get_timetable_not_found(client, auth_headers):
    response = await client.get("/api/timetable/99999", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Class not found"

@pytest.mark.asyncio
async def test_get_timetable_unauthorized(client):
    response = await client.get("/api/timetable/1")
    assert response.status_code == 401
