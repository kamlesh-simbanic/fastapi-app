import { Student } from './student';

export interface SchoolClass {
    id: number;
    standard: string;
    division: string;
    class_teacher_id?: number;
    class_teacher?: {
        name: string;
    };
}

export interface ClassStudent {
    id: number;
    academic_year: string;
    class_id: number;
    students: number[];
    school_class?: SchoolClass;
    student?: Student;
}
