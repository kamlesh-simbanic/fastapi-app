'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Users,
    Search,
    Filter,
    Loader2,
    X,
    ChevronDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Table from '@/components/Table';
import { DEPARTMENTS, getDepartmentColor } from '@/lib/departments';
import { Staff } from './types';
import { STAFF_COLUMNS } from './utils';

const PAGE_SIZE_OPTIONS = [6, 12, 24, 50];

const SORT_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Qualification', value: 'qualification' },
    { label: 'Location', value: 'city' },
    { label: 'Date Joined', value: 'created_at' },
];

export default function StaffPage() {
    const { user } = useAuth();

    const [staff, setStaff] = useState<Staff[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [pageSize, setPageSize] = useState(12);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchStaff();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchStaff, user]);


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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Directory</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage and view all organization personnel.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Dropdown  */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">Sort by:</span>
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-card border border-border rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer min-w-[140px] shadow-sm"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 bg-card border border-border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95"
                        >
                            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-primary" /> : <ArrowDown className="w-4 h-4 text-primary" />}
                        </button>
                    </div>

                    <div className="w-px h-8 bg-secondary/80 dark:bg-zinc-800 mx-1" />

                    <Link href="/staff/add" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add Staff
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="space-y-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or qualification..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-xl text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">
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
                                    isActive ? cn("shadow-md scale-105 z-10", colors) : "bg-card border-border text-muted-foreground hover:border-zinc-300"
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
                    <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                        <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setError(null)} />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground text-sm font-medium animate-pulse">Syncing directory...</p>
                    </div>
                ) : staff.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted/50 rounded-3xl border border-dashed border-border text-center">
                        <Users className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-foreground">No personnel found</h3>
                        <button onClick={() => { setSearch(''); setSelectedDepartments([]); }} className="text-primary text-sm font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <Table
                        columns={STAFF_COLUMNS}
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
