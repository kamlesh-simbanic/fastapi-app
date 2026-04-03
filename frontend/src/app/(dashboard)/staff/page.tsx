'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import {
    Users,
    Search,
    Filter,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Loader2,
    X,
    LayoutGrid,
    List,
    Pencil,
    ChevronDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import Table, { Column } from '@/components/Table';
import { cn } from '@/lib/utils';
import { DEPARTMENTS, getDepartmentColor } from '@/lib/departments';

interface StaffMember {
    id: number;
    name: string;
    mobile: string;
    email: string;
    department: string;
    qualification: string;
    city: string;
    leave_balance: number;
    created_at: string;
}

const PAGE_SIZE_OPTIONS = [6, 12, 24, 50];

const SORT_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Qualification', value: 'qualification' },
    { label: 'Location', value: 'city' },
    { label: 'Date Joined', value: 'created_at' },
];

export default function StaffPage() {
    const { user } = useAuth();

    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [pageSize, setPageSize] = useState(6);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [error, setError] = useState<string | null>(null);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const skip = (page - 1) * pageSize;
            const data = await api.getStaff({
                search,
                department: selectedDepartments,
                skip,
                limit: pageSize,
                sort_by: sortBy,
                order: sortOrder
            });
            setStaff(data.items);
            setTotal(data.total);
        } catch (err: unknown) {
            console.error('Failed to fetch staff:', err);
            const msg = err instanceof Error ? err.message : 'Failed to load staff members. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [search, selectedDepartments, page, pageSize, sortBy, sortOrder]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const columns: Column<StaffMember>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            className: 'font-bold text-zinc-900 dark:text-white text-sm'
        },
        {
            key: 'department',
            label: 'Department',
            render: (member) => (
                <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", getDepartmentColor(member.department))}>
                    {member.department}
                </span>
            )
        },
        {
            key: 'qualification',
            label: 'Degree',
            sortable: true,
            className: 'text-xs font-medium text-zinc-500'
        },
        {
            key: 'contact',
            label: 'Contact Info',
            render: (member) => (
                <div className="text-[11px] text-zinc-400">
                    <div className="text-zinc-600 dark:text-zinc-300 font-medium">{member.email}</div>
                    <div>{member.mobile}</div>
                </div>
            )
        },
        {
            key: 'city',
            label: 'City',
            sortable: true,
            className: 'text-xs text-zinc-500'
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (member) => (
                <span className="text-xs text-zinc-500">
                    {new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (member) => (
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/staff/edit?id=${member.id}`} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all">
                        <Pencil className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchStaff();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchStaff, user]);

    useEffect(() => {
        // Set view mode based on screen size on mount
        if (window.innerWidth < 1024) {
            setViewMode('grid');
        } else {
            setViewMode('grid'); // Staff defaults to grid anyway
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, selectedDepartments, pageSize]);

    const toggleDepartment = (deptValue: string) => {
        if (deptValue === '') {
            setSelectedDepartments([]);
        } else {
            setSelectedDepartments(prev =>
                prev.includes(deptValue)
                    ? prev.filter(d => d !== deptValue)
                    : [...prev, deptValue]
            );
        }
    };

    if (!user) return null;


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Staff Directory</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage and view all organization personnel.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Dropdown for Grid/Mobile */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline">Sort by:</span>
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer min-w-[140px] shadow-sm"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95"
                        >
                            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-indigo-500" /> : <ArrowDown className="w-4 h-4 text-indigo-500" />}
                        </button>
                    </div>

                    <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/staff/add" className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add Staff
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="space-y-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or qualification..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">
                        <Filter className="w-3.5 h-3.5" /> Dept:
                    </div>
                    {DEPARTMENTS.map((dept) => {
                        const isActive = dept.value === '' ? selectedDepartments.length === 0 : selectedDepartments.includes(dept.value);
                        const colors = getDepartmentColor(dept.value || 'other');
                        return (
                            <button
                                key={dept.value}
                                onClick={() => toggleDepartment(dept.value)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    isActive ? cn("shadow-md scale-105 z-10", colors) : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
                                )}
                            >
                                {dept.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                        <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setError(null)} />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-zinc-500 text-sm font-medium animate-pulse">Syncing directory...</p>
                    </div>
                ) : staff.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <Users className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No personnel found</h3>
                        <button onClick={() => { setSearch(''); setSelectedDepartments([]); }} className="text-indigo-500 text-sm font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {staff.map((member) => (
                            <div key={member.id} className="group p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-20 h-20 text-indigo-500" /></div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Link href={`/staff/edit?id=${member.id}`} className="p-2 bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-indigo-500 transition-all shadow-sm"><Pencil className="w-4 h-4" /></Link>
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center"><Users className="w-6 h-6 text-indigo-500" /></div>
                                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", getDepartmentColor(member.department))}>{member.department}</span>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{member.name}</h3>
                                    <p className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">{member.qualification}</p>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400"><Mail className="w-4 h-4 text-zinc-400" /><span className="truncate">{member.email}</span></div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400"><Phone className="w-4 h-4 text-zinc-400" /><span>{member.mobile}</span></div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400"><MapPin className="w-4 h-4 text-zinc-400" /><span>{member.city}</span></div>
                                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Joined:</span>
                                        <span className="text-[10px]">{new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                <button className="mt-6 w-full py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all">View Full Profile</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={staff}
                        loading={loading}
                        totalCount={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        emptyMessage="No personnel found matching your filters."
                    />
                )}
            </div>

        </div>
    );
}
