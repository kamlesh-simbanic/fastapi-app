export interface StaffMember {
    id: number;
    name: string;
    department: string;
}

export interface LeaveRequest {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    staff?: StaffMember;
    created_at?: string;
}
