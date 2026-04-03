import { SchoolClass } from '../classes/types';

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
