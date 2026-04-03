'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import {
    Users,
    Search,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Calendar,
    MapPin,
    Phone,
    GraduationCap,
    Loader2,
    ChevronDown,
    UserCircle,
    ArrowUp,
    ArrowDown,
    X,
    Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface StudentMember {
    id: number;
    gr_no: string;
    name: string;
    father_name: string;
    surname: string;
    mobile: string;
    dob: string;
    city: string;
    status: string;
}

const PAGE_SIZE_OPTIONS = [6, 12, 24, 50];

const SORT_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'GR No', value: 'gr_no' },
    { label: 'Date of Birth', value: 'dob' },
    { label: 'City', value: 'city' },
];

export default function StudentsPage() {
    const { user } = useAuth();

    const [students, setStudents] = useState<StudentMember[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(12);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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
        // Switch to grid view on small screens by default
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setViewMode('grid');
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);


    const totalPages = Math.ceil(total / pageSize);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-h2 font-weight-h2 tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-lg shadow-primary-main/20">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        Student Directory
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage and review student enrollment and academic profiles.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-radius-medium border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-primary-main shadow-sm" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-800 text-primary-main shadow-sm" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50")}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/students/add" className="px-4 py-2.5 bg-primary-main text-white rounded-radius-medium text-sm font-semibold hover:bg-primary-dark shadow-md shadow-primary-main/10 active:scale-95 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Register Student
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 group-focus-within:text-primary-main transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, GR number, or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main/50 transition-all shadow-sm italic placeholder:opacity-50"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium px-4 py-3 pr-10 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main/50 transition-all cursor-pointer shadow-sm italic"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>Sorted by {opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-3 bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95 text-primary-main"
                    >
                        {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </button>
                </div>
            </section>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {error && (
                    <div className="mb-8 p-4 rounded-radius-medium bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-error animate-in slide-in-from-top-2">
                        <Loader2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                        <X className="w-4 h-4 ml-auto cursor-pointer" onClick={() => setError(null)} />
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-400 animate-in fade-in duration-500">
                        <Loader2 className="w-10 h-10 text-primary-main animate-spin" />
                        <p className="font-medium text-sm">Refreshing records...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Users className="w-8 h-8 text-zinc-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No students found</h3>
                            <p className="text-sm text-zinc-500 italic">Try adjusting your search or filters.</p>
                        </div>
                        <button onClick={() => { setSearch(''); }} className="text-primary-main text-sm font-semibold hover:underline">Clear all filters</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {students.map((member) => (
                            <div key={member.id} className="group p-5 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/30 transition-all hover:shadow-xl hover:shadow-primary-main/5 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-surface-ground dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-lg text-[10px] font-bold font-mono">
                                        #{member.gr_no}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center text-center mt-4 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform overflow-hidden relative">
                                        <UserCircle className="w-12 h-12 text-zinc-300 group-hover:text-primary-main/50 transition-colors" />
                                        <div className="absolute inset-0 bg-primary-main/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-primary-main group-hover:italic transition-all">
                                        {member.name} {member.surname}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-1 uppercase tracking-widest text-[9px] opacity-70">
                                        Son of {member.father_name}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-5 border-t border-zinc-50 dark:border-zinc-800/50 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 text-primary-main/70" />
                                            DOB
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 italic">
                                            {new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                            <MapPin className="w-3.5 h-3.5 text-success/70" />
                                            City
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 italic">
                                            {member.city}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                            <Phone className="w-3.5 h-3.5 text-primary-main/70" />
                                            Contact
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 italic">
                                            {member.mobile}
                                        </span>
                                    </div>
                                </div>

                                <Link href={`/students/edit?id=${member.id}`} className="mt-6 flex items-center justify-center gap-2 py-3 rounded-radius-medium bg-primary-main text-white hover:bg-primary-dark transition-all text-xs font-bold shadow-md shadow-primary-main/10 uppercase tracking-widest">
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit Profile
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-surface-ground">
                                    <tr>
                                        <th onClick={() => handleSort('gr_no')} className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] cursor-pointer hover:text-primary-main border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">GR NO {sortBy === 'gr_no' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-main" /> : <ArrowDown className="w-3 h-3 text-primary-main" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}</div>
                                        </th>
                                        <th onClick={() => handleSort('name')} className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] cursor-pointer hover:text-primary-main border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">Student Name {sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-main" /> : <ArrowDown className="w-3 h-3 text-primary-main" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}</div>
                                        </th>
                                        <th onClick={() => handleSort('dob')} className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] cursor-pointer hover:text-primary-main border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">DOB {sortBy === 'dob' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-main" /> : <ArrowDown className="w-3 h-3 text-primary-main" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}</div>
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Contact</th>
                                        <th onClick={() => handleSort('city')} className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] cursor-pointer hover:text-primary-main border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">City {sortBy === 'city' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-main" /> : <ArrowDown className="w-3 h-3 text-primary-main" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}</div>
                                        </th>
                                        <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                    {students.map((member) => (
                                        <tr key={member.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold font-mono text-zinc-500">#{member.gr_no}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-primary-main group-hover:italic transition-all">{member.name} {member.surname}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">Son of {member.father_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-zinc-600 dark:text-zinc-400 italic">{new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-zinc-600 dark:text-zinc-400 italic">{member.mobile}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-zinc-600 dark:text-zinc-400 italic">{member.city}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/students/edit?id=${member.id}`} className="p-3 text-zinc-300 hover:text-primary-main hover:bg-primary-main/5 rounded-xl transition-all"><Pencil className="w-4.5 h-4.5" /></Link>
                                                    <button className="p-3 text-zinc-200 hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"><X className="w-4.5 h-4.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rows per page</span>
                        <div className="relative group">
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium px-4 py-2 pr-10 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 cursor-pointer shadow-sm"
                            >
                                {PAGE_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Records</option>)}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Total Records: <span className="text-primary-main ml-1">{total}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        className="p-3 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 bg-surface-paper dark:bg-zinc-900 text-zinc-500 hover:text-primary-main disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {(() => {
                            const maxPages = 5;
                            let startPage = Math.max(1, page - Math.floor(maxPages / 2));
                            let endPage = startPage + maxPages - 1;

                            if (endPage > totalPages) {
                                endPage = totalPages;
                                startPage = Math.max(1, endPage - maxPages + 1);
                            }

                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(i);
                            }

                            return pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-10 h-10 rounded-radius-medium text-[10px] font-bold uppercase transition-all shadow-sm",
                                        page === p
                                            ? "bg-primary-main text-white shadow-xl shadow-primary-main/20 ring-4 ring-primary-main/5 active:scale-95"
                                            : "bg-surface-paper dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-800"
                                    )}
                                >
                                    {p.toString().padStart(2, '0')}
                                </button>
                            ));
                        })()}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        className="p-3 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 bg-surface-paper dark:bg-zinc-900 text-zinc-500 hover:text-primary-main disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
