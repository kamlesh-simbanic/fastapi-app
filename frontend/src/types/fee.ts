import { Student } from './student';
import { SchoolClass } from './class';

export interface FeePayment {
    id: number;
    gr_no: string;
    student_id: number;
    term: string;
    year: number;
    amount: number;
    payment_method: string;
    payment_details?: string;
    created_at: string;
    student?: Student;
}

export interface FeeStructure {
    id: number;
    class_id: number;
    year: number;
    fee_amount: number;
    school_class?: SchoolClass;
    standard?: string;
    base_fee?: number;
    activity_fee?: number;
    lab_fee?: number;
    total_fee?: number;
}
