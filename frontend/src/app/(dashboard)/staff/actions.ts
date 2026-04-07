'use server';

import { api } from '@/lib/api';

export async function getStaff(params: Record<string, unknown> = {}) {
    try {
        return await api.getStaff(params);
    } catch (error) {
        console.error('getStaff error:', error);
        throw error;
    }
}

export async function getStaffById(id: string | number) {
    try {
        return await api.getStaffById(id);
    } catch (error) {
        console.error('getStaffById error:', error);
        throw error;
    }
}

export async function addStaff(data: Record<string, unknown>) {
    try {
        return await api.addStaff(data);
    } catch (error) {
        console.error('addStaff error:', error);
        throw error;
    }
}

export async function updateStaff(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateStaff(id, data);
    } catch (error) {
        console.error('updateStaff error:', error);
        throw error;
    }
}

export async function deleteStaff(id: string | number) {
    try {
        return await api.deleteStaff(id);
    } catch (error) {
        console.error('deleteStaff error:', error);
        throw error;
    }
}
