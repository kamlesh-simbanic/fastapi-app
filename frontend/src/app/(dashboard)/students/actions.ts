'use server';

import { api } from '@/lib/api';

export async function getStudents(params: Record<string, unknown> = {}) {
    try {
        return await api.getStudents(params);
    } catch (error) {
        console.error('Action getStudents failed:', error);
        throw error;
    }
}

export async function getStudentById(id: string | number) {
    try {
        return await api.getStudentById(id);
    } catch (error) {
        console.error('Action getStudentById failed:', error);
        throw error;
    }
}

export async function addStudent(data: Record<string, unknown>) {
    try {
        return await api.addStudent(data);
    } catch (error) {
        console.error('Action addStudent failed:', error);
        throw error;
    }
}

export async function updateStudent(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateStudent(id, data);
    } catch (error) {
        console.error('Action updateStudent failed:', error);
        throw error;
    }
}

export async function getStudentsByClass(classId: string | number) {
    try {
        return await api.getStudentsByClass(classId);
    } catch (error) {
        throw error;
    }
}
