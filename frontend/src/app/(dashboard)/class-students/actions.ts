'use server';

import { api } from '@/lib/api';

export async function getClassStudents(params: Record<string, unknown> = {}) {
    try {
        return await api.getClassStudents(params);
    } catch (error) {
        console.error('getClassStudents error:', error);
        throw error;
    }
}

export async function getClassStudentById(id: string | number) {
    try {
        return await api.getClassStudentById(id);
    } catch (error) {
        console.error('getClassStudentById error:', error);
        throw error;
    }
}

export async function addClassStudent(data: Record<string, unknown>) {
    try {
        return await api.addClassStudent(data);
    } catch (error) {
        console.error('addClassStudent error:', error);
        throw error;
    }
}

export async function updateClassStudent(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateClassStudent(id, data);
    } catch (error) {
        console.error('updateClassStudent error:', error);
        throw error;
    }
}

export async function deleteClassStudent(id: string | number) {
    try {
        return await api.deleteClassStudent(id);
    } catch (error) {
        console.error('deleteClassStudent error:', error);
        throw error;
    }
}
