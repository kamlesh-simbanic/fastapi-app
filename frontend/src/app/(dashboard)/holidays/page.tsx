'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    Clock,
    X,
    Trash2,
    Sparkles
} from 'lucide-react';

import { ConfirmBox } from '@/components/ConfirmBox';
import CalendarPicker from '@/components/CalendarPicker';


interface Holiday {
    id: number;
    name: string;
    date: string;
    number_of_days: number;
    created_at: string;
}

export default function HolidaysPage() {
    const { user } = useAuth();

    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchHolidays = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getHolidays({ sort_by: 'date', order: 'asc' });
            setHolidays(data);
        } catch {
            setError('Failed to load academic intermissions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchHolidays();
        }
    }, [fetchHolidays, user]);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await api.addHoliday(formData);
            setSuccess('Academic intermission scheduled successfully!');
            setIsAddModalOpen(false);
            setFormData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                number_of_days: 1
            });
            fetchHolidays();
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError('Failed to schedule academic intermission.');
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
            setSuccess('Break record removed successfully!');
            fetchHolidays();
            setTimeout(() => setSuccess(null), 3000);
            setDeleteConfirmOpen(false);
        } catch {
            setError('Failed to remove academic intermission.');
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
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                        <CalendarDays className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white flex items-center gap-4 italic tracking-tight uppercase leading-none">
                            Intermissions
                        </h1>
                        <p className="text-primary-main/60 font-black text-[10px] uppercase tracking-[0.3em] italic leading-none">Institutional Break Registry</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-4 bg-primary-main text-white px-8 py-4 rounded-radius-medium font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-primary-main/20 hover:bg-primary-dark transition-all active:scale-95 italic ring-4 ring-primary-main/5"
                >
                    <Plus className="w-4.5 h-4.5" />
                    Schedule Break
                </button>
            </section>

            {error && (
                <div className="p-6 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center gap-5 text-error animate-in slide-in-from-top-2 shadow-sm font-black uppercase tracking-widest italic text-[11px]">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-6 rounded-radius-medium bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-5 text-primary-main animate-in slide-in-from-top-2 shadow-sm font-black uppercase tracking-widest italic text-[11px]">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    {success}
                </div>
            )}

            {/* Holidays Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-44 gap-8 text-zinc-500 animate-in fade-in duration-700">
                    <Loader2 className="w-20 h-20 text-primary-main animate-spin" />
                    <div className="text-center space-y-2">
                        <p className="font-black text-[11px] tracking-[0.5em] uppercase opacity-70 italic">Cataloging Intermissions...</p>
                        <p className="text-[10px] font-black text-zinc-400 animate-pulse italic uppercase tracking-widest leading-none">Synchronizing institutional calendar</p>
                    </div>
                </div>
            ) : holidays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-44 gap-10 bg-surface-ground/30 dark:bg-zinc-900/10 rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-main/10 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="relative w-28 h-28 rounded-radius-large bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                            <Sparkles className="w-14 h-14 text-primary-main opacity-20" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight italic uppercase">Academic Continuity</h3>
                        <p className="text-zinc-500 text-[10px] max-w-sm mx-auto font-black italic uppercase tracking-[0.3em] leading-loose opacity-60">No upcoming intermissions scheduled in the registry. The institutional session remains uninterrupted.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-primary-main font-black text-[10px] uppercase tracking-[0.4em] hover:underline decoration-2 underline-offset-8 italic"
                    >
                        Schedule Primary Break
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700">
                    {holidays.map((holiday) => (
                        <div
                            key={holiday.id}
                            className="group bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm hover:shadow-2xl hover:shadow-primary-main/5 transition-all duration-500 hover:border-primary-main/20 relative overflow-hidden ring-1 ring-zinc-50 dark:ring-zinc-800/10"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-main/5 -mr-20 -mt-20 rounded-full blur-3xl group-hover:bg-primary-main/10 transition-colors" />

                            <div className="flex flex-col h-full space-y-8 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 flex items-center justify-center text-zinc-100 dark:text-zinc-700 group-hover:bg-primary-main group-hover:text-white transition-all transform group-hover:scale-110 duration-500 shadow-inner border border-zinc-50 dark:border-zinc-700">
                                        <CalendarDays className="w-7 h-7" />
                                    </div>
                                    <button
                                        onClick={() => triggerDelete(holiday.id)}
                                        className="p-2.5 text-zinc-300 hover:text-error hover:bg-error/5 rounded-radius-medium transition-all transform active:scale-95"
                                    >
                                        <Trash2 className="w-5.5 h-5.5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight italic uppercase group-hover:text-primary-main transition-colors">
                                        {holiday.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="inline-flex items-center gap-3 px-4 py-2 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-500 tracking-widest border border-zinc-50 dark:border-zinc-700 italic shadow-sm">
                                            <Clock className="w-4 h-4 text-primary-main" />
                                            {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                        </span>
                                        <span className="inline-flex items-center gap-3 px-4 py-2 rounded-radius-medium bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.2em] border border-primary-main/10 italic shadow-lg shadow-primary-main/10">
                                            {holiday.number_of_days} Day{holiday.number_of_days > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Holiday Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-zinc-950/60 animate-in fade-in duration-500">
                    <div className="bg-surface-paper dark:bg-zinc-900 w-full max-w-2xl rounded-radius-large shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300 ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                        <div className="p-12 space-y-12">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-h2 font-weight-h2 flex items-center gap-4 text-zinc-900 dark:text-white tracking-tight italic uppercase leading-none">
                                        <Sparkles className="w-7 h-7 text-primary-main" />
                                        Intermission
                                    </h2>
                                    <p className="text-[10px] text-zinc-400 font-black italic uppercase tracking-widest opacity-60 leading-none">Register a new break in the institutional timeline.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-12 h-12 rounded-radius-medium hover:bg-surface-ground dark:hover:bg-zinc-800 flex items-center justify-center transition-all group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700"
                                >
                                    <X className="w-6 h-6 text-zinc-300 group-hover:text-primary-main transition-colors" />
                                </button>
                            </div>

                            <form onSubmit={handleAddHoliday} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-3 ml-1 italic leading-none">
                                        Occasion Identity
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="E.G. FESTIVAL SEASON, SEMESTER BREAK"
                                        className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-5 px-8 focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-white placeholder:opacity-20 italic uppercase tracking-widest"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="flex flex-col justify-end">
                                        <CalendarPicker
                                            label="Commencement Epoch"
                                            value={formData.date}
                                            onChange={(date) => setFormData({ ...formData, date: date })}
                                            minDate={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-3 ml-1 italic leading-none">
                                            Temporal Span (Days)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.number_of_days}
                                            onChange={(e) => setFormData({ ...formData, number_of_days: parseInt(e.target.value) })}
                                            className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-5 px-8 focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-white italic tabular-nums"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-8 py-5 bg-surface-ground dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-95 italic border border-zinc-50 dark:border-zinc-700"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-primary-main text-white py-5 rounded-radius-medium font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-primary-main/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 italic ring-4 ring-primary-main/5"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Commit Schedule
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
                title="Decommission Record"
                description="Are you certain you wish to remove this intermission from the institutional calendar? This transformation cannot be re-synchronized."
                onConfirm={handleDeleteHoliday}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Purge Record"
                variant="danger"
            />
        </div>
    );
}
