export interface LeaveRequest {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
}
