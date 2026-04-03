export interface StaffMember {
    id: number;
    name: string;
    mobile: string;
    email: string;
    department: string;
    qualification: string;
    city: string;
    leave_balance: number;
    created_at: string;
}

// Alias for generic use
export type Staff = StaffMember;
