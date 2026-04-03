'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    User,
    Calendar as CalendarIcon,
    Loader2,
    ChevronLeft,
    AlertCircle,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LeaveRequest } from '../types';
import Table from '@/components/Table';
import { getLeaveApprovalColumns } from '../utils';


export default function LeaveApprovalsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
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
            // In a real scenario, the backend might handle these filters
            // For now, we fetch all applicable to the user and filter client-side if needed, 
            // or use specific query params if the backend supports them.
            const data = await api.getLeaveRequests({ view: 'approvals' });
            setRequests(data);
        } catch (err: unknown) {
            setError((err as any).message);
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
            setSuccess(`Request ${status} successfully!`);
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: unknown) {
            setError((err as any).message);
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

        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/leave" className="p-3 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tight uppercase">Approval Center</h1>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1 italic">Manage Team Leave Applications</p>
                    </div>
                </div>

                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm" : "text-zinc-400")}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm" : "text-zinc-400")}
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Quick Stats & Filters */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-4 p-2 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2rem] shadow-sm">
                        {(['pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "flex-1 min-w-[120px] py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                                    statusFilter === status
                                        ? status === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                                            status === 'approved' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                                "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                        : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                )}
                            >
                                {status === 'pending' ? <Clock className="w-4 h-4" /> :
                                    status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> :
                                        <XCircle className="w-4 h-4" />}
                                {status} ({stats[status]})
                            </button>
                        ))}
                    </div>

                    {/* Search & Dept Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl pl-14 pr-6 py-4 font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl pl-14 pr-6 py-4 font-bold text-sm appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all uppercase tracking-widest"
                            >
                                <option value="all">All Departments</option>
                                <option value="teaching">Teaching</option>
                                <option value="management">Management</option>
                                <option value="admin">Admin</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="hidden xl:block space-y-6">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h3 className="font-black text-xl italic mb-6">Today&apos;s Activity</h3>
                        <div className="space-y-4">
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Pending Approval</p>
                                <p className="text-3xl font-black italic">{stats.pending}</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Actioned Today</p>
                                <p className="text-3xl font-black italic">{stats.approved + stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {success && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-tight">{success}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                </div>
            )}

            {/* Main Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                        <Filter className="w-10 h-10 text-zinc-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic">No requests found</h3>
                        <p className="text-zinc-500 font-bold text-sm tracking-tight mt-1">Try adjusting your filters or search term</p>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm hover:border-indigo-500/30 transition-all group flex flex-col h-full"
                                >
                                    <div className="space-y-6 flex-grow">
                                        {/* User Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <User className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg italic tracking-tight leading-none mb-1.5">{req.staff?.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-black uppercase tracking-widest text-zinc-500">{req.staff?.department}</span>
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase italic">ID: {req.staff_id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Leave Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest italic">{req.leave_type} Leave</div>
                                                <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="relative px-4 py-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium italic italic line-clamp-3 leading-relaxed">&quot;{req.reason}&quot;</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-8 pt-6 border-t-2 border-zinc-50 dark:border-zinc-800 flex gap-2">
                                        {req.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                    className="flex-1 bg-white dark:bg-zinc-900 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div className={cn(
                                                "w-full text-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2",
                                                req.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                            )}>
                                                {req.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                {req.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table
                            columns={getLeaveApprovalColumns({
                                onUpdateStatus: handleUpdateStatus
                            })}
                            data={filteredRequests}
                            emptyMessage="No requests matches your filter."
                        />
                    )}
                </div>
            )}
        </div>

    );
}
