'use server';

import { api } from '@/lib/api';

export async function getFeeStructures(params: Record<string, unknown> = {}) {
    try {
        return await api.getFeeStructures(params);
    } catch (error) {
        console.error('getFeeStructures error:', error);
        throw error;
    }
}

export async function addFeeStructure(data: Record<string, unknown>) {
    try {
        return await api.addFeeStructure(data);
    } catch (error) {
        console.error('addFeeStructure error:', error);
        throw error;
    }
}

export async function updateFeeStructure(id: string | number, data: Record<string, unknown>) {
    try {
        return await api.updateFeeStructure(id, data);
    } catch (error) {
        console.error('updateFeeStructure error:', error);
        throw error;
    }
}

export async function deleteFeeStructure(id: string | number) {
    try {
        return await api.deleteFeeStructure(id);
    } catch (error) {
        console.error('deleteFeeStructure error:', error);
        throw error;
    }
}
