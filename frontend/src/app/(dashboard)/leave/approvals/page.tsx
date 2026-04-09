'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowLeft,
    Search,
    Filter,
} from 'lucide-react';
import Link from 'next/link';
import { LeaveRequest } from '../types';
import Table from '@/components/Table';
import { getApprovalLeaveColumns } from '../utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function ApprovalsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.getLeaveRequests({ view: 'approvals' });
            setRequests(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id: number, status: 'approved' | 'rejected') => {
        try {
            setActionLoading(id);
            setError(null);
            await api.updateLeaveRequestStatus(id, { status });
            setSuccess(`Request ${status} successfully!`);
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.staff?.name.toLowerCase().includes(search.toLowerCase()) ||
            r.reason.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!user) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link
                        href="/leave"
                        className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all mb-2"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to My Leave
                    </Link>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        Leave Approvals
                    </h1>
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === status
                                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error/Success Feed */}
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold uppercase tracking-tight">{success}</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Stats Panel */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-zinc-900 dark:bg-zinc-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-all duration-700" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">Approval Stats</h3>
                        <div className="space-y-6">
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black italic">{requests.filter(r => r.status === 'pending').length}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pending Actions</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                            <div className="h-px bg-zinc-800" />
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black italic">{requests.filter(r => r.status === 'approved').length}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Approved</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-8 rounded-[2.5rem] space-y-6">
                        <h3 className="font-black italic text-zinc-900 dark:text-white uppercase tracking-tight">Quick Filters</h3>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search namesake..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Panel */}
                <div className="xl:col-span-3">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
                            <h3 className="font-black text-xl italic tracking-tight">Leave Manifest</h3>
                            <button
                                onClick={fetchData}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                title="Refresh"
                            >
                                <Loader2 className={cn("w-5 h-5 text-indigo-500", loading && "animate-spin")} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Archiving records...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mb-6">
                                    <Filter className="w-10 h-10 text-zinc-200" />
                                </div>
                                <h4 className="text-xl font-black italic text-zinc-900 dark:text-white">No requests found</h4>
                                <p className="text-zinc-500 text-sm max-w-xs mt-2 font-medium">There are no leave requests matching your current filter criteria.</p>
                            </div>
                        ) : (
                            <Table
                                columns={getApprovalLeaveColumns({
                                    onApprove: (id) => handleAction(id, 'approved'),
                                    onReject: (id) => handleAction(id, 'rejected'),
                                    loadingId: actionLoading
                                })}
                                data={filteredRequests}
                                loading={loading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
