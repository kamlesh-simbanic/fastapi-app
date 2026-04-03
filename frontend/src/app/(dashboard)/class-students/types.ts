import { SchoolClass } from '../classes/types';
import { Student } from '../students/types';

export interface ClassStudent {
    id: number;
    academic_year: string;
    class_id: number;
    students: number[];
    school_class?: SchoolClass;
    student?: Student;
}
