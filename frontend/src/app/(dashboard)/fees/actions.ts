'use server';

import { api } from '@/lib/api';

export async function getPayments(params: Record<string, unknown> = {}) {
    try {
        return await api.getPayments(params);
    } catch (error) {
        console.error('getPayments error:', error);
        throw error;
    }
}

export async function addPayment(data: Record<string, unknown>) {
    try {
        return await api.addPayment(data);
    } catch (error) {
        console.error('addPayment error:', error);
        throw error;
    }
}

export async function getSuggestedFee(grNo: string | number, year: string | number) {
    try {
        return await api.getSuggestedFee(grNo, year);
    } catch (error) {
        console.error('getSuggestedFee error:', error);
        throw error;
    }
}
