'use server';

import { api } from '@/lib/api';

export async function getSubjects(params: Record<string, unknown> = {}) {
    try {
        return await api.getSubjects(params);
    } catch (error) {
        console.error('getSubjects error:', error);
        throw error;
    }
}

export async function addSubject(data: Record<string, unknown>) {
    try {
        return await api.addSubject(data);
    } catch (error) {
        console.error('addSubject error:', error);
        throw error;
    }
}

export async function updateSubject(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateSubject(id, data);
    } catch (error) {
        console.error('updateSubject error:', error);
        throw error;
    }
}

export async function deleteSubject(id: string | number) {
    try {
        return await api.deleteSubject(id);
    } catch (error) {
        console.error('deleteSubject error:', error);
        throw error;
    }
}

export async function getSubjectAssignments(subjectId: string | number) {
    try {
        return await api.getSubjectAssignments(subjectId);
    } catch (error) {
        console.error('getSubjectAssignments error:', error);
        throw error;
    }
}

export async function assignTeacher(data: Record<string, unknown>) {
    try {
        return await api.assignTeacher(data);
    } catch (error) {
        console.error('assignTeacher error:', error);
        throw error;
    }
}

export async function unassignTeacher(assignmentId: string | number) {
    try {
        return await api.unassignTeacher(assignmentId);
    } catch (error) {
        console.error('unassignTeacher error:', error);
        throw error;
    }
}
