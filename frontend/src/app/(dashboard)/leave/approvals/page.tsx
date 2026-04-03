'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    XCircle,
    Clock,
    Search,
    Filter,
    User,
    Calendar as CalendarIcon,
    Loader2,
    ChevronLeft,
    ShieldAlert,
    LayoutGrid,
    List as ListIcon,
    Fingerprint,
    ShieldCheck,
    TrendingUp,
    FileText,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StaffMember {
    id: number;
    name: string;
    department: string;
}

interface LeaveRequestData {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    staff?: StaffMember;
    created_at: string;
}

export default function LeaveApprovalsPage() {
    const [requests, setRequests] = useState<LeaveRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [deptFilter, setDeptFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.getLeaveRequests({ view: 'approvals' });
            setRequests(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        try {
            await api.updateLeaveRequestStatus(id, { status });
            setSuccess(`Leave request ${status === 'approved' ? 'Approved' : 'Rejected'}.`);
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update leave status');
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.staff?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.staff_id.toString().includes(searchTerm);
        const matchesStatus = req.status === statusFilter;
        const matchesDept = deptFilter === 'all' || req.staff?.department === deptFilter;
        return matchesSearch && matchesStatus && matchesDept;
    });

    const stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header section */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <Link
                        href="/leave"
                        className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-blue-600 hover:text-blue-600 transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Leave Approvals
                        </h1>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic flex items-center gap-2">
                            Leave Review & Approval <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        </p>
                    </div>
                </div>

                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-3 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-800" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Grid View
                    </button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-3 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-800" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <ListIcon className="w-4 h-4" />
                        List View
                    </button>
                </div>
            </section>

            {/* Quick Stats & Filters */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                <div className="xl:col-span-3 space-y-10">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-4 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                        {(['pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "flex-1 min-w-[150px] py-5 px-8 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border",
                                    statusFilter === status
                                        ? status === 'pending' ? "bg-amber-500 border-amber-600 text-white shadow-xl shadow-amber-500/20" :
                                            status === 'approved' ? "bg-blue-600 border-blue-700 text-white shadow-xl shadow-blue-600/20" :
                                                "bg-red-500 border-red-600 text-white shadow-xl shadow-red-500/20"
                                        : "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600"
                                )}
                            >
                                {status === 'pending' ? <Clock className="w-3.5 h-3.5" /> :
                                    status === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                                        <XCircle className="w-3.5 h-3.5" />}
                                {status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected'}
                                <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold border tabular-nums",
                                    statusFilter === status ? "bg-white/20 border-transparent" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                )}>
                                    {stats[status]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search & Dept Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by staff name or ID..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-16 pr-8 py-5 text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:opacity-50 shadow-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-16 pr-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] appearance-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm italic"
                            >
                                <option value="all">All Departments</option>
                                <option value="teaching">Teaching Staff</option>
                                <option value="management">Management</option>
                                <option value="admin">Administrative Staff</option>
                                <option value="other">Support Staff</option>
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="hidden xl:block space-y-8">
                    <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl p-10 text-white shadow-2xl shadow-zinc-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-100 opacity-60 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-lg tracking-tight uppercase tracking-widest">Approval Stats</h3>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/stat">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Pending Requests</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-bold italic tabular-nums">{stats.pending}</p>
                                    <Clock className="w-5 h-5 text-amber-500 opacity-20 group-hover/stat:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/stat">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Total Processed</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-bold italic tabular-nums">{stats.approved + stats.rejected}</p>
                                    <ShieldCheck className="w-5 h-5 text-blue-400 opacity-20 group-hover/stat:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {success && (
                <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 flex items-center gap-4 animate-in slide-in-from-left-4 shadow-sm">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold italic">{success}</p>
                    <button onClick={() => setSuccess(null)} className="ml-auto p-2 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && (
                <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 flex items-center gap-4 animate-in slide-in-from-left-4 shadow-sm">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold italic">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6 animate-pulse">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-600 opacity-20" />
                        <CalendarRange className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] italic">Loading Approvals...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-32 text-center flex flex-col items-center gap-8 shadow-sm">
                    <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 group hover:scale-110 transition-transform duration-500">
                        <Filter className="w-10 h-10 text-zinc-300 opacity-40 group-hover:text-blue-600 group-hover:opacity-10 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">No leave requests found for this filter.</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic underline decoration-blue-600/30">Try changing the status or search terms.</p>
                    </div>
                </div>
            ) : (
                <div className={cn(
                    viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        : "space-y-6"
                )}>
                    {filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className={cn(
                                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-600/30 transition-all group relative overflow-hidden",
                                viewMode === 'grid' ? "rounded-2xl p-10 shadow-sm flex flex-col h-full" : "rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 shadow-sm"
                            )}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                            <div className={cn(viewMode === 'grid' ? "space-y-8 flex-grow" : "flex flex-col md:flex-row items-start md:items-center gap-10 flex-grow")}>
                                {/* Beneficiary Info */}
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shadow-sm">
                                        <User className="w-7 h-7 text-zinc-500 dark:text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight group-hover:italic transition-all">{req.staff?.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500">{req.staff?.department}</span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">ID: {req.staff_id}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Petition Insight */}
                                <div className={cn("space-y-4", viewMode === 'grid' ? "" : "md:flex-1 md:space-y-1")}>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="px-4 py-1.5 bg-blue-600/5 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-600/10 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] italic transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">{req.leave_type.charAt(0).toUpperCase() + req.leave_type.slice(1)} Leave</div>
                                        <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700">
                                            <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="tabular-nums italic">{new Date(req.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            <ChevronRight className="w-3 h-3 opacity-40 group-hover:translate-x-1 transition-transform" />
                                            <span className="tabular-nums italic">{new Date(req.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="relative p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 group/reason">
                                        <FileText className="absolute -left-3 -top-3 w-6 h-6 text-zinc-200 dark:text-zinc-700 group-hover/reason:text-blue-600/20 transition-colors" />
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium italic leading-relaxed line-clamp-3">&quot;{req.reason}&quot;</p>
                                    </div>
                                </div>
                            </div>

                            {/* Authorizations */}
                            <div className={cn("flex gap-3", viewMode === 'grid' ? "mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800" : "flex-shrink-0")}>
                                {req.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                                        >
                                            <ShieldCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                            className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-red-500 hover:bg-red-600 hover:text-white px-8 py-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] active:scale-95 transition-all hover:border-red-600 shadow-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <div className={cn(
                                        "px-10 py-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 border shadow-sm w-full justify-center italic",
                                        req.status === 'approved' ? "bg-blue-600/10 text-blue-600 border-blue-600/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                                    )}>
                                        {req.status === 'approved' ? <ShieldCheck className="w-4 h-4 animate-in zoom-in-50" /> : <XCircle className="w-4 h-4 animate-in zoom-in-50" />}
                                        {req.status === 'approved' ? 'Approved' : 'Rejected'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const CalendarRange = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="M17 14h-6" />
        <path d="M13 18h-2" />
        <path d="m15 18-2-4-2 4" />
    </svg>
);
