'use server';

import { api } from '@/lib/api';

export async function getDashboardStats() {
    try {
        return await api.getDashboardStats();
    } catch (error) {
        console.error('getDashboardStats error:', error);
        throw error;
    }
}

export async function getDbStatus() {
    try {
        return await api.getDbStatus();
    } catch (error) {
        console.error('getDbStatus error:', error);
        throw error;
    }
}
