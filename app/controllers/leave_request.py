from typing import Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from ..models import LeaveRequest, LeaveStatus, Staff, Department
from ..schemas.leave_request import LeaveRequestCreate, LeaveRequestUpdate

def create_leave_request(db: Session, obj_in: LeaveRequestCreate, staff_id: int, user_id: int):
    # 1. Verify staff exists and is eligible
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    if staff.department == Department.ADMIN:
        raise HTTPException(
            status_code=400, 
            detail="Admin staff cannot apply for leave via this module"
        )

    # 2. Create the request
    db_obj = LeaveRequest(
        **obj_in.model_dump(),
        staff_id=staff_id,
        created_by_id=user_id,
        status=LeaveStatus.PENDING
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Mock Notification to Approvers
    print(f"NOTIFY (ADMIN/MGMT): New leave request from {staff.name} ({staff.department.value}) - ID: {db_obj.id}")
    
    return db_obj

def get_leave_requests(db: Session, staff_id: Optional[int] = None, approver_staff: Optional[Staff] = None):
    # Use joinedload to fetch staff details for the frontend
    query = db.query(LeaveRequest).options(joinedload(LeaveRequest.staff))
    
    if staff_id:
        # Staff viewing their own requests
        query = query.filter(LeaveRequest.staff_id == staff_id)
    elif approver_staff:
        # Approver viewing pending requests they are allowed to approve
        if approver_staff.department == Department.ADMIN:
            # Admins can see all pending requests
            query = query.filter(LeaveRequest.status == LeaveStatus.PENDING)
        elif approver_staff.department == Department.MANAGEMENT:
            # Management can see Teaching and Other pending requests
            query = query.join(Staff, LeaveRequest.staff_id == Staff.id).filter(
                Staff.department.in_([Department.TEACHING, Department.OTHER]),
                LeaveRequest.status == LeaveStatus.PENDING
            )
        else:
            # Others can't see anything for approval
            return []
    
    return query.order_by(LeaveRequest.created_at.desc()).all()

def update_leave_status(db: Session, leave_id: int, obj_in: LeaveRequestUpdate, approver_user_id: int):
    # 1. Get the leave request and applicant's staff record
    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    applicant_staff = db.query(Staff).filter(Staff.id == leave_req.staff_id).first()
    
    # 2. Get approver's staff record
    approver_staff = db.query(Staff).filter(Staff.user_id == approver_user_id).first()
    if not approver_staff:
        raise HTTPException(status_code=403, detail="Only staff members can approve leaves")

    # 3. Check approval permissions
    can_approve = False
    
    # TEACHING/OTHER apps -> must be approved by MANAGEMENT or ADMIN
    if applicant_staff.department in [Department.TEACHING, Department.OTHER]:
        if approver_staff.department in [Department.MANAGEMENT, Department.ADMIN]:
            can_approve = True
            
    # MANAGEMENT apps -> must be approved by ADMIN
    elif applicant_staff.department == Department.MANAGEMENT:
        if approver_staff.department == Department.ADMIN:
            can_approve = True

    if not can_approve:
        raise HTTPException(
            status_code=403, 
            detail=f"You do not have permission to approve leaves for {applicant_staff.department.value} department"
        )

    # 4. Prevent self-approval
    if leave_req.staff_id == approver_staff.id:
        raise HTTPException(status_code=400, detail="You cannot approve your own leave request")

    # 5. Update status
    leave_req.status = obj_in.status
    leave_req.updated_by_id = approver_user_id
    db.commit()
    db.refresh(leave_req)
    
    # Mock Notification to Applicant
    print(f"NOTIFY (STAFF): Your leave request has been {obj_in.status.value} by {approver_staff.name}")
    
    return leave_req
