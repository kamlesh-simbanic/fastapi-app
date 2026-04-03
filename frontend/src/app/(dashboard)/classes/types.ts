export interface SchoolClass {
    id: number;
    standard: string;
    division: string;
    class_teacher_id?: number;
    class_teacher?: {
        name: string;
    };
}
