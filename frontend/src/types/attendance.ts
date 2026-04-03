import { SchoolClass } from './class';
import { Student } from './student';

export interface AttendanceRecord {
    id: number;
    student_id: number;
    class_id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
    student?: Student;
    school_class?: SchoolClass;
}
