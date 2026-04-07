'use server';

import { api } from '@/lib/api';

export async function getClasses(params: Record<string, unknown> = {}) {
    try {
        return await api.getClasses(params);
    } catch (error) {
        console.error('getClasses error:', error);
        throw error;
    }
}

export async function getClassById(id: string | number) {
    try {
        return await api.getClassById(id);
    } catch (error) {
        console.error('getClassById error:', error);
        throw error;
    }
}

export async function addClass(data: Record<string, unknown>) {
    try {
        return await api.addClass(data);
    } catch (error) {
        console.error('addClass error:', error);
        throw error;
    }
}

export async function updateClass(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateClass(id, data);
    } catch (error) {
        console.error('updateClass error:', error);
        throw error;
    }
}

export async function deleteClass(id: string | number) {
    try {
        return await api.deleteClass(id);
    } catch (error) {
        console.error('deleteClass error:', error);
        throw error;
    }
}
