'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import CalendarPicker from '@/components/CalendarPicker';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Plus,
    Clock,
    ChevronRight,
    LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { LeaveRequest } from './types';
import Table from '@/components/Table';
import { getPersonalLeaveColumns } from './utils';

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [approvals, setApprovals] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        leave_type: 'casual',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const personal = await api.getLeaveRequests({ view: 'personal' });
            setLeaveRequests(personal);

            // Fetch approvals to see if we should show the "Manage Approvals" button
            try {
                const pendingApprovals = await api.getLeaveRequests({ view: 'approvals' });
                setApprovals(pendingApprovals);
            } catch {
                setApprovals([]);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date) {
            setError("Please select both start and end dates");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);
            await api.addLeaveRequest(formData);
            setSuccess("Leave request submitted successfully!");
            setShowForm(false);
            setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (

            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>

        );
    }

    return (

        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tight">Leave Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Apply for leave and track your requests</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {approvals.length > 0 && (
                        <Link
                            href="/leave/approvals"
                            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-2xl font-bold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 shadow-sm"
                        >
                            <LayoutGrid className="w-5 h-5 text-indigo-500" /> Manage Approvals
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setError(null);
                            setSuccess(null);
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        {showForm ? 'View History' : <><Plus className="w-5 h-5" /> Apply for Leave</>}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-tight">{success}</p>
                </div>
            )}

            {showForm ? (
                /* Leave Form */
                <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-zinc-900 dark:text-white italic">
                        <Plus className="w-6 h-6 text-indigo-500" /> New Leave Request
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Loader2 className="w-3 h-3" /> Leave Type
                                </label>
                                <select
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm appearance-none"
                                >
                                    <option value="casual">Casual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal Leave</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <CalendarPicker
                                    label="Start Date"
                                    placeholder="Pick start date"
                                    value={formData.start_date}
                                    onChange={(date: string) => setFormData({ ...formData, start_date: date })}
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="space-y-3">
                                <CalendarPicker
                                    label="End Date"
                                    placeholder="Pick end date"
                                    value={formData.end_date}
                                    onChange={(date: string) => setFormData({ ...formData, end_date: date })}
                                    minDate={formData.start_date || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <Plus className="w-3 h-3" /> Reason for Leave
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm resize-none"
                                placeholder="Please provide a detailed reason..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Application'}
                        </button>
                    </form>
                </div>
            ) : (
                /* Dashboard View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm">
                            <h3 className="font-black text-xl mb-6 italic">Balance Summary</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-tight">Pending</span>
                                    </div>
                                    <span className="font-black text-2xl italic">{leaveRequests.filter(r => r.status === 'pending').length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-tight">Approved</span>
                                    </div>
                                    <span className="font-black text-2xl italic">{leaveRequests.filter(r => r.status === 'approved').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
                                <h3 className="font-black text-xl italic mb-6">Today&apos;s Activity</h3>
                                <button className="text-indigo-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight className="w-3 h-3" /></button>
                            </div>
                            <Table
                                columns={getPersonalLeaveColumns()}
                                data={leaveRequests}
                                loading={loading}
                                emptyMessage="No leave requests found in your history."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
