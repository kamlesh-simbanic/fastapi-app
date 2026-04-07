'use server';

import { api } from '@/lib/api';

export async function getTimetable(classId: string | number) {
    try {
        return await api.getTimetable(classId);
    } catch (error) {
        console.error('getTimetable error:', error);
        throw error;
    }
}
