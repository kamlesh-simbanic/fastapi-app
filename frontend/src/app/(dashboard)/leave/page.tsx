'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import CalendarPicker from '@/components/CalendarPicker';
import {
    Clock,
    XCircle,
    Plus,
    Loader2,
    ChevronRight,
    CalendarRange,
    History,
    FileText,
    Send,
    ShieldAlert,
    ShieldCheck,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LeaveRequestData {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestData[]>([]);
    const [approvals, setApprovals] = useState<LeaveRequestData[]>([]);
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

            try {
                const pendingApprovals = await api.getLeaveRequests({ view: 'approvals' });
                setApprovals(pendingApprovals);
            } catch {
                setApprovals([]);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load leave records');
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
            setError("Please select both start and end dates.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(null);
            await api.addLeaveRequest(formData);
            setSuccess("Leave request submitted successfully for approval.");
            setShowForm(false);
            setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
            fetchData();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit leave request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <ShieldCheck className="w-4 h-4 text-blue-600" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in duration-700">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 opacity-20" />
                    <CalendarRange className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] italic">Loading Leave Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header section with humanized micro-copy */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Staff Leave
                    </h1>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic flex items-center gap-2">
                        Leave Management <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {approvals.length > 0 && (
                        <Link
                            href="/leave/approvals"
                            className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-95 shadow-xl shadow-zinc-900/10 group"
                        >
                            <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Approval Management
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setError(null);
                            setSuccess(null);
                        }}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 border-2 shadow-sm",
                            showForm
                                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600"
                                : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                        )}
                    >
                        {showForm ? <History className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? 'View History' : 'Apply for Leave'}
                    </button>
                </div>
            </section>

            {/* Notification Layer */}
            {(error || success) && (
                <div className="grid grid-cols-1 gap-4">
                    {error && (
                        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 flex items-center gap-4 animate-in slide-in-from-left-4">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold italic">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 flex items-center gap-4 animate-in slide-in-from-left-4">
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold italic">{success}</p>
                        </div>
                    )}
                </div>
            )}

            {showForm ? (
                /* Institutional Form Design */
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                        <div className="p-12 space-y-12">
                            <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-4 italic group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:rotate-[360deg] transition-transform duration-1000">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    New Leave Request
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] ml-16">Leave Application Form</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <CalendarRange className="w-3.5 h-3.5 text-blue-600" /> Leave Type
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={formData.leave_type}
                                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-5 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-bold text-sm appearance-none italic"
                                            >
                                                <option value="casual">Casual Leave</option>
                                                <option value="sick">Sick Leave</option>
                                                <option value="personal">Personal Leave</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <CalendarRange className="w-3.5 h-3.5 text-blue-600" /> Select Dates
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <CalendarPicker
                                                label=""
                                                placeholder="Start Date"
                                                value={formData.start_date}
                                                onChange={(date: string) => setFormData({ ...formData, start_date: date })}
                                                minDate={new Date().toISOString().split('T')[0]}
                                            />
                                            <CalendarPicker
                                                label=""
                                                placeholder="End Date"
                                                value={formData.end_date}
                                                onChange={(date: string) => setFormData({ ...formData, end_date: date })}
                                                minDate={formData.start_date || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Reason for Leave
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-5 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-bold text-sm resize-none italic leading-relaxed placeholder:opacity-50"
                                            placeholder="Enter the reason for your leave request..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] hover:scale-[1.01] active:scale-95 shadow-2xl group"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Submit Request
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                /* Premium Dashboard Layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Perspective Column */}
                    <div className="lg:col-span-1 space-y-10">
                        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm space-y-8">
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl tracking-tight italic">Leave Status</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">Overview</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all group/stat">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/stat:rotate-12 transition-transform">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Pending</span>
                                        </div>
                                        <span className="text-4xl font-bold italic tabular-nums">{leaveRequests.filter(r => r.status === 'pending').length}</span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-xl bg-blue-600/5 border border-blue-600/10 hover:border-blue-600/30 transition-all group/stat">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover/stat:scale-110 transition-transform">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Approved</span>
                                        </div>
                                        <span className="text-4xl font-bold italic tabular-nums">{leaveRequests.filter(r => r.status === 'approved').length}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Informative Micro-copy */}
                        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs text-zinc-500 font-medium italic leading-relaxed">
                                Leave requests are reviewed by the administration. Please provide a clear reason for your leave request.
                            </p>
                        </div>
                    </div>

                    {/* Archival Column */}
                    <div className="lg:col-span-2">
                        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-xl italic tracking-tight uppercase tracking-widest text-xs">Leave History</h3>
                                </div>
                            </div>

                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                                {leaveRequests.length === 0 ? (
                                    <div className="p-32 text-center flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                                            <Search className="w-8 h-8 text-zinc-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold italic tracking-tight">No leave history found.</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic decoration-blue-600/30 underline">You have not submitted any leave requests yet.</p>
                                        </div>
                                    </div>
                                ) : (
                                    leaveRequests.map((req) => (
                                        <div key={req.id} className="p-10 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm">
                                                        <CalendarRange className="w-7 h-7" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="font-bold text-xl text-zinc-900 dark:text-white italic tracking-tight">{req.leave_type.charAt(0).toUpperCase() + req.leave_type.slice(1)} Leave</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700 tabular-nums">
                                                                <span className="italic">{new Date(req.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                                <ChevronRight className="w-3 h-3 opacity-40 group-hover:translate-x-1 transition-transform" />
                                                                <span className="italic">{new Date(req.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm self-start md:self-center italic",
                                                    req.status === 'approved' ? "bg-blue-600/5 text-blue-600 border-blue-600/10" :
                                                        req.status === 'rejected' ? "bg-red-500/5 text-red-600 border-red-500/10" :
                                                            "bg-amber-500/5 text-amber-600 border-amber-500/10"
                                                )}>
                                                    {getStatusIcon(req.status)}
                                                    {getStatusLabel(req.status)}
                                                </div>
                                            </div>
                                            <div className="pl-[88px] relative">
                                                <div className="p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 group/msg transition-all hover:border-blue-600/20">
                                                    <FileText className="absolute -left-12 top-6 w-5 h-5 text-zinc-200 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-all group-hover:rotate-12" />
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium italic leading-relaxed">&quot;{req.reason}&quot;</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}
