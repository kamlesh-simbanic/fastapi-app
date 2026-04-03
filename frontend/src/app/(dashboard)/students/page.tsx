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
import Table, { Column } from '@/components/Table';
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

    const columns: Column<StudentMember>[] = [
        {
            key: 'gr_no',
            label: 'GR No',
            sortable: true,
            render: (member) => (
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded text-[10px] font-black font-mono tracking-widest group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {member.gr_no}
                </span>
            )
        },
        {
            key: 'name',
            label: 'Student Name',
            sortable: true,
            render: (member) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-zinc-900 dark:text-white leading-tight group-hover:text-indigo-500 transition-colors">
                        {member.name} {member.surname}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">S/O {member.father_name}</span>
                </div>
            )
        },
        {
            key: 'dob',
            label: 'Birth Date',
            sortable: true,
            render: (member) => (
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                    {new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'mobile',
            label: 'Contact',
            className: 'text-xs font-bold text-zinc-600 dark:text-zinc-300'
        },
        {
            key: 'city',
            label: 'City',
            sortable: true,
            className: 'text-xs font-bold text-zinc-500 uppercase tracking-wider'
        },
        {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (member) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/students/edit?id=${member.id}`} className="p-2.5 text-zinc-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
                        <Pencil className="w-4 h-4" />
                    </Link>
                    <button className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

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
        if (window.innerWidth < 1024) {
            setViewMode('grid');
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);



    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        Student Directory
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage student academic records and admissions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/students/add" className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add Student
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, GR number, or surname..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>Sort by: {opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95 text-indigo-500"
                    >
                        {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </button>
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
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in duration-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Synchronizing Students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <Users className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Empty Directory</h3>
                        <button onClick={() => { setSearch(''); }} className="text-indigo-500 text-sm font-bold hover:underline">Clear search filter</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {students.map((member) => (
                            <div key={member.id} className="group p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden flex flex-col">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                        <UserCircle className="w-8 h-8 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-xl flex flex-col items-center justify-center shadow-lg">
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">GR NO</span>
                                        <span className="text-xs font-black font-mono leading-none">{member.gr_no}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                        {member.name} {member.surname}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 uppercase tracking-wide">
                                        S/O {member.father_name}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Born</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                {new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Region</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                {member.city}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                            <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                            {member.mobile}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-6">
                                    <Link href={`/students/edit?id=${member.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold border border-zinc-100 dark:border-zinc-800">
                                        <Pencil className="w-3.5 h-3.5" />
                                        Update Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={columns}
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
