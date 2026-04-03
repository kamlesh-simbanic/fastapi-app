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
    ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEPARTMENTS, getDepartmentColor } from '@/lib/departments';

import Table, { Column } from '@/components/Table';


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

    const columns: Column<StaffMember>[] = [
        {
            key: 'name',
            label: 'Full Name',
            sortable: true,
            render: (member) => (
                <span className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-primary-main group-hover:italic transition-all">{member.name}</span>
            )
        },
        {
            key: 'department',
            label: 'Department',
            render: (member) => (
                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border italic", getDepartmentColor(member.department))}>{member.department}</span>
            )
        },
        {
            key: 'qualification',
            label: 'Degree',
            sortable: true,
            render: (member) => <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">{member.qualification}</span>
        },
        {
            key: 'contact',
            label: 'Contact Details',
            render: (member) => (
                <div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-widest truncate max-w-[150px]">{member.email}</div>
                    <div className="text-[10px] text-zinc-400 font-bold tracking-widest">{member.mobile}</div>
                </div>
            )
        },
        {
            key: 'city',
            label: 'Location',
            sortable: true,
            render: (member) => <span className="text-xs font-bold text-zinc-500 italic">{member.city}</span>
        },
        {
            key: 'created_at',
            label: 'Joined',
            sortable: true,
            render: (member) => (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{new Date(member.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: (member) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/staff/edit?id=${member.id}`} className="p-3 text-zinc-300 hover:text-primary-main hover:bg-primary-main/5 rounded-radius-medium transition-all shadow-sm"><Pencil className="w-4.5 h-4.5" /></Link>
                    <button className="p-3 text-zinc-200 hover:text-error hover:bg-red-50 dark:hover:bg-red-500/10 rounded-radius-medium transition-all opacity-0 group-hover:opacity-100 shadow-sm"><X className="w-4.5 h-4.5" /></button>
                </div>
            ),
            className: "text-right"
        }
    ];

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

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchStaff();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchStaff, user]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setViewMode('grid');
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
                    <h1 className="text-h2 font-weight-h2 tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-lg shadow-primary-main/20">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        Staff Directory
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">Manage and organize your academic and administrative team.</p>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'grid' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">Sort by:</span>
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium px-4 py-2 pr-10 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 transition-all cursor-pointer min-w-[140px] shadow-sm italic"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2.5 bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95 text-primary-main"
                            >
                                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            </button>
                        </div>
                    )}

                    {viewMode === 'grid' && <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-1" />}

                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-radius-medium border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-primary-main shadow-sm" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-800 text-primary-main shadow-sm" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50")}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/staff/add" className="px-5 py-2.5 bg-primary-main text-white rounded-radius-medium text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary-main/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        Add Member
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="space-y-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary-main transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or qualification..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-large py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main/50 transition-all shadow-sm italic placeholder:opacity-50"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-2 italic">
                        <Filter className="w-3.5 h-3.5" /> Filter by Dept:
                    </div>
                    {DEPARTMENTS.map((dept) => {
                        const isActive = dept.value === '' ? selectedDepartments.length === 0 : selectedDepartments.includes(dept.value);
                        const colors = getDepartmentColor(dept.value || 'other');
                        return (
                            <button
                                key={dept.value}
                                onClick={() => toggleDepartment(dept.value)}
                                className={cn(
                                    "px-4 py-2 rounded-radius-medium text-[10px] font-bold uppercase tracking-widest transition-all border italic",
                                    isActive ? cn("shadow-md scale-105 z-10", colors) : "bg-surface-paper dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300"
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
                    <div className="mb-8 p-4 rounded-radius-medium bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-error animate-in slide-in-from-top-2">
                        <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setError(null)} />
                        <p className="text-sm font-bold tracking-tight italic">{error}</p>
                    </div>
                )}

                {viewMode === 'grid' ? (
                    loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary-main animate-spin" />
                            <p className="text-zinc-500 text-sm font-medium animate-pulse italic">Syncing directory records...</p>
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            <Users className="w-12 h-12 text-zinc-300" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white italic">No personnel found</h3>
                            <button onClick={() => { setSearch(''); setSelectedDepartments([]); }} className="text-primary-main text-sm font-bold hover:underline italic">Clear all filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {staff.map((member) => (
                                <div key={member.id} className="group p-6 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/30 transition-all hover:shadow-xl hover:shadow-primary-main/5 relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-20 h-20 text-primary-main" /></div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Link href={`/staff/edit?id=${member.id}`} className="p-2.5 bg-surface-paper/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-radius-medium text-zinc-400 hover:text-primary-main transition-all shadow-sm"><Pencil className="w-4 h-4" /></Link>
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-radius-medium bg-primary-main/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary-main" /></div>
                                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border italic", getDepartmentColor(member.department))}>{member.department}</span>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-primary-main group-hover:italic transition-all">{member.name}</h3>
                                        <p className="text-primary-main dark:text-primary-light text-xs font-bold uppercase tracking-widest opacity-80 italic">{member.qualification}</p>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex-1">
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 italic"><Mail className="w-4 h-4 text-zinc-300" /><span className="truncate">{member.email}</span></div>
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 italic"><Phone className="w-4 h-4 text-zinc-300" /><span>{member.mobile}</span></div>
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 italic"><MapPin className="w-4 h-4 text-zinc-300" /><span>{member.city}</span></div>
                                        <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-500 mt-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Joined Primary Force:</span>
                                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">{new Date(member.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <button className="mt-6 w-full py-3 rounded-radius-medium bg-surface-ground dark:bg-zinc-950 text-zinc-900 dark:text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-zinc-200 dark:border-zinc-800 hover:bg-primary-main hover:text-white dark:hover:bg-primary-main group-hover:shadow-lg group-hover:shadow-primary-main/10 transition-all italic">Review Details</button>
                                </div>
                            ))}
                        </div>
                    )
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
                        emptyMessage="No staff members found matching your criteria."
                    />
                )}
            </div>
        </div>
    );
}
