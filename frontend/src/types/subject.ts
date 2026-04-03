import { Staff } from './staff';

export interface Subject {
    id: number;
    name: string;
}

export interface Assignment {
    id: number;
    subject_id: number;
    teacher_id: number;
    teacher?: Staff;
}
