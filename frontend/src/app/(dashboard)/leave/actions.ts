'use server';

import { api } from '@/lib/api';

export async function getLeaveRequests(params: Record<string, unknown> = {}) {
    try {
        return await api.getLeaveRequests(params);
    } catch (error) {
        console.error('getLeaveRequests error:', error);
        throw error;
    }
}

export async function addLeaveRequest(data: Record<string, unknown>) {
    try {
        return await api.addLeaveRequest(data);
    } catch (error) {
        console.error('addLeaveRequest error:', error);
        throw error;
    }
}

export async function updateLeaveRequestStatus(leaveId: string | number, data: { status: string }) {
    try {
        return await api.updateLeaveRequestStatus(leaveId, data);
    } catch (error) {
        console.error('updateLeaveRequestStatus error:', error);
        throw error;
    }
}
