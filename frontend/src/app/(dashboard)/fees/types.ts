import { Student } from '../students/types';

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
