'use server';

import { api } from '@/lib/api';

export async function getHolidays(params: Record<string, unknown> = {}) {
    try {
        return await api.getHolidays(params);
    } catch (error) {
        console.error('getHolidays error:', error);
        throw error;
    }
}

export async function addHoliday(data: Record<string, unknown>) {
    try {
        return await api.addHoliday(data);
    } catch (error) {
        console.error('addHoliday error:', error);
        throw error;
    }
}

export async function updateHoliday(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateHoliday(id, data);
    } catch (error) {
        console.error('updateHoliday error:', error);
        throw error;
    }
}

export async function deleteHoliday(id: string | number) {
    try {
        return await api.deleteHoliday(id);
    } catch (error) {
        console.error('deleteHoliday error:', error);
        throw error;
    }
}
