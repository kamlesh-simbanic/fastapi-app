'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Calendar,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    X,
} from 'lucide-react';

import { ConfirmBox } from '@/components/ConfirmBox';
import CalendarPicker from '@/components/CalendarPicker';
import Table from '@/components/Table';
import { getHolidayColumns } from './utils';


import { useGlobalData } from '@/context/GlobalContext';

export default function HolidaysPage() {
    const { user } = useAuth();
    const { holidays, loading: globalLoading, refreshHolidays } = useGlobalData();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        number_of_days: 1
    });

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await api.addHoliday(formData);
            setSuccess('Holiday added successfully!');
            setIsAddModalOpen(false);
            setFormData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                number_of_days: 1
            });
            refreshHolidays();
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError('Failed to add holiday.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHoliday = async () => {
        if (!idToDelete) return;

        setIsDeleting(true);
        setError(null);
        try {
            await api.deleteHoliday(idToDelete);
            setSuccess('Holiday deleted successfully!');
            refreshHolidays();
            setTimeout(() => setSuccess(null), 3000);
            setDeleteConfirmOpen(false);
        } catch {
            setError('Failed to delete holiday.');
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const triggerDelete = (id: number) => {
        setIdToDelete(id);
        setDeleteConfirmOpen(true);
    };

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-space">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <CalendarDays className="w-6 h-6 text-white" />
                        </div>
                        School Holidays
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">Manage upcoming school holidays and breaks.</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Holiday
                </button>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{success}</p>
                </div>
            )}

            {/* Holidays Grid */}
            {globalLoading.holidays ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="font-bold text-sm tracking-widest uppercase opacity-70">Syncing holidays...</p>
                </div>
            ) : (
                <Table
                    columns={getHolidayColumns({
                        onDelete: triggerDelete
                    })}
                    data={holidays}
                    loading={globalLoading.holidays}
                    emptyMessage="No holidays scheduled yet."
                />
            )}

            {/* Add Holiday Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300 backdrop-blur-md bg-black/20">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden outline-none animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 italic">
                                        <Calendar className="w-6 h-6 text-amber-500" />
                                        Add New Holiday
                                    </h2>
                                    <p className="text-xs text-zinc-500 font-medium">Define a new break for the school calendar.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddHoliday} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        Holiday Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Diwali Break, Winter Vacation"
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-4 px-6 focus:outline-none focus:border-amber-500 transition-all font-bold placeholder:text-zinc-300 italic"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <CalendarPicker
                                            label="Start Date"
                                            value={formData.date}
                                            onChange={(date) => setFormData({ ...formData, date: date })}
                                            minDate={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                            Duration (Days)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.number_of_days}
                                            onChange={(e) => setFormData({ ...formData, number_of_days: parseInt(e.target.value) })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-4 px-6 focus:outline-none focus:border-amber-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Schedule Holiday
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Box */}
            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Delete Holiday"
                description="Are you sure you want to remove this holiday from the schedule? This action cannot be undone."
                onConfirm={handleDeleteHoliday}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
