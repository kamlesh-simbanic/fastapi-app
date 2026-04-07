'use server';

import { api } from '@/lib/api';

export async function getAttendance(params: Record<string, unknown>) {
    try {
        return await api.getAttendance(params);
    } catch (error) {
        console.error('getAttendance error:', error);
        throw error;
    }
}

export async function submitAttendance(data: Record<string, unknown>) {
    try {
        return await api.submitAttendance(data);
    } catch (error) {
        console.error('submitAttendance error:', error);
        throw error;
    }
}

export async function getMonthlyReport(params: { class_id: number; month: number; year: number }) {
    try {
        return await api.getMonthlyReport(params);
    } catch (error) {
        console.error('getMonthlyReport error:', error);
        throw error;
    }
}

export async function getMonthlyReportPDF(params: { class_id: number; month: number; year: number }) {
    try {
        return await api.getMonthlyReportPDF(params);
    } catch (error) {
        console.error('getMonthlyReportPDF error:', error);
        throw error;
    }
}
