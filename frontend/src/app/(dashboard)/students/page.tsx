'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Users,
    Search,
    GraduationCap,
    Loader2,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    X
} from 'lucide-react';
import Table from '@/components/Table';
import { Student } from './types';
import { STUDENT_COLUMNS } from './utils';



const PAGE_SIZE_OPTIONS = [6, 12, 24, 50];

const SORT_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'GR No', value: 'gr_no' },
    { label: 'Date of Birth', value: 'dob' },
    { label: 'City', value: 'city' },
];

export default function StudentsPage() {
    const { user } = useAuth();

    const [students, setStudents] = useState<Student[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(12);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [error, setError] = useState<string | null>(null);


    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const skip = (page - 1) * pageSize;
            const data = await api.getStudents({
                search,
                skip,
                limit: pageSize,
                sort_by: sortBy,
                order: sortOrder
            });
            setStudents(data.items);
            setTotal(data.total);
        } catch (err: unknown) {
            console.error('Failed to fetch students:', err);
            const msg = err instanceof Error ? err.message : 'Failed to load students. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [search, page, pageSize, sortBy, sortOrder]);

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
                fetchStudents();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchStudents, user]);


    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);



    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        Student Directory
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage student academic records and admissions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/students/add" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add Student
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, GR number, or surname..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-xl text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-card border border-border rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>Sort by: {opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-3.5 bg-card border border-border rounded-2xl hover:bg-muted transition-colors shadow-sm active:scale-95 text-primary"
                    >
                        {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </button>
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
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground animate-in fade-in duration-500">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Synchronizing Students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted/30 rounded-3xl border border-dashed border-border text-center">
                        <Users className="w-12 h-12 text-muted-foreground/30" />
                        <h3 className="text-lg font-bold text-foreground">Empty Directory</h3>
                        <button onClick={() => { setSearch(''); }} className="text-primary text-sm font-bold hover:underline">Clear search filter</button>
                    </div>

                ) : (
                    <Table
                        columns={STUDENT_COLUMNS}
                        data={students}
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
                        emptyMessage="Empty Directory"
                    />
                )}
            </div>

        </div>
    );
}
