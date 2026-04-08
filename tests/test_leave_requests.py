import pytest
from datetime import date, timedelta
from app import models, utils
from tests.conftest import TestingSessionLocal
from app.models.leave_request import LeaveType, LeaveStatus
from app.models.staff import Department

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

_mobile_counter = 0

@pytest.fixture
def create_staff_user(db_session):
    def _create(email, name, dept):
        global _mobile_counter
        user = db_session.query(models.User).filter(models.User.email == email).first()
        if not user:
            _mobile_counter += 1
            mobile = f"9988776{_mobile_counter:03d}"
            user = models.User(
                name=name,
                email=email,
                mobile=mobile,
                hashed_password=utils.get_password_hash("password123"),
                is_active=True
            )
            db_session.add(user)
            db_session.commit()
            db_session.refresh(user)
        
        staff = db_session.query(models.Staff).filter(models.Staff.user_id == user.id).first()
        if not staff:
            staff = models.Staff(
                name=name,
                email=email,
                mobile=user.mobile,
                department=dept,
                user_id=user.id
            )
            db_session.add(staff)
            db_session.commit()
            db_session.refresh(staff)
        return user, staff
    return _create

@pytest.fixture
def teaching_staff(create_staff_user):
    return create_staff_user("teacher_leave@test.com", "Leave Teacher", Department.TEACHING)

@pytest.fixture
def management_staff(create_staff_user):
    return create_staff_user("mgmt_leave@test.com", "Leave Mgmt", Department.MANAGEMENT)

@pytest.fixture
def admin_staff(create_staff_user):
    return create_staff_user("admin_leave@test.com", "Leave Admin", Department.ADMIN)

def get_auth_headers(user):
    token = utils.create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_leave_request(client, teaching_staff):
    user, staff = teaching_staff
    headers = get_auth_headers(user)
    
    payload = {
        "leave_type": "sick",
        "start_date": str(date.today() + timedelta(days=1)),
        "end_date": str(date.today() + timedelta(days=2)),
        "reason": "Feeling unwell"
    }
    
    response = await client.post("/api/leave-requests/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["leave_type"] == "sick"
    assert data["status"] == "pending"
    assert data["staff_id"] == staff.id

@pytest.mark.asyncio
async def test_admin_cannot_apply_leave(client, admin_staff):
    user, _ = admin_staff
    headers = get_auth_headers(user)
    
    payload = {
        "leave_type": "other",
        "start_date": str(date.today()),
        "end_date": str(date.today()),
        "reason": "Admin test"
    }
    
    response = await client.post("/api/leave-requests/", json=payload, headers=headers)
    assert response.status_code == 400
    assert "Admin staff cannot apply for leave" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_personal_leaves(client, teaching_staff, db_session):
    user, staff = teaching_staff
    headers = get_auth_headers(user)
    
    # Pre-create a leave
    leave = models.LeaveRequest(
        staff_id=staff.id,
        leave_type=LeaveType.CASUAL,
        start_date=date.today(),
        end_date=date.today(),
        reason="Test",
        status=LeaveStatus.PENDING,
        created_by_id=user.id
    )
    db_session.add(leave)
    db_session.commit()
    
    response = await client.get("/api/leave-requests/?view=personal", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["staff_id"] == staff.id

@pytest.mark.asyncio
async def test_approval_workflow_teaching_by_management(client, teaching_staff, management_staff, db_session):
    teacher_user, teacher_staff = teaching_staff
    mgmt_user, mgmt_staff = management_staff
    
    # Create request
    leave = models.LeaveRequest(
        staff_id=teacher_staff.id,
        leave_type=LeaveType.SICK,
        start_date=date.today(),
        end_date=date.today(),
        reason="Sick",
        status=LeaveStatus.PENDING,
        created_by_id=teacher_user.id
    )
    db_session.add(leave)
    db_session.commit()
    db_session.refresh(leave)
    
    # Approve by Mgmt
    headers = get_auth_headers(mgmt_user)
    response = await client.patch(f"/api/leave-requests/{leave.id}/status", json={"status": "approved"}, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

@pytest.mark.asyncio
async def test_self_approval_denied(client, management_staff, db_session):
    user, staff = management_staff
    
    # Mgmt creates request
    leave = models.LeaveRequest(
        staff_id=staff.id,
        leave_type=LeaveType.PERSONAL,
        start_date=date.today(),
        end_date=date.today(),
        reason="Personal",
        status=LeaveStatus.PENDING,
        created_by_id=user.id
    )
    db_session.add(leave)
    db_session.commit()
    
    # Self approve attempt
    headers = get_auth_headers(user)
    response = await client.patch(f"/api/leave-requests/{leave.id}/status", json={"status": "approved"}, headers=headers)
    
    # It returns 403 because Mgmt cannot approve Mgmt department leaves
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_management_approval_denied_to_management(client, management_staff, db_session, create_staff_user):
    # Mgmt 1 cannot approve Mgmt 2's leave (Admins only for Mgmt)
    mgmt2_user, mgmt2_staff = create_staff_user("mgmt2_leave@test.com", "Mgmt 2", Department.MANAGEMENT)
    mgmt1_user, _ = management_staff
    
    leave = models.LeaveRequest(
        staff_id=mgmt2_staff.id,
        leave_type=LeaveType.PERSONAL,
        start_date=date.today(),
        end_date=date.today(),
        reason="Test",
        status=LeaveStatus.PENDING,
        created_by_id=mgmt2_user.id
    )
    db_session.add(leave)
    db_session.commit()
    
    headers = get_auth_headers(mgmt1_user)
    response = await client.patch(f"/api/leave-requests/{leave.id}/status", json={"status": "approved"}, headers=headers)
    
    assert response.status_code == 403
    assert "do not have permission" in response.json()["detail"]
