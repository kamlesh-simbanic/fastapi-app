'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Users,
    ChevronLeft,
    Loader2,
    Calendar,
    BadgeCheck,
    UserCircle,
    LayoutGrid,
    List,
    Search,
    X,
    Filter
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Student {
    id: number;
    name: string;
    surname: string;
    gr_no: string;
    gender: string;
}

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface MappingDetail {
    id: number;
    academic_year: string;
    class_id: number;
    school_class: SchoolClass;
    student_details: Student[];
}

function ClassStudentDetailContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mappingId = searchParams.get('id');

    const [mapping, setMapping] = useState<MappingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [search, setSearch] = useState('');

    const fetchDetail = useCallback(async () => {
        if (!mappingId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.getClassStudentDetail(parseInt(mappingId));
            setMapping(data);
        } catch (err: unknown) {
            console.error('Failed to fetch detail:', err);
            setError('Failed to load class assignment details.');
        } finally {
            setLoading(false);
        }
    }, [mappingId]);

    useEffect(() => {
        if (user && mappingId) {
            fetchDetail();
        }
    }, [fetchDetail, user, mappingId]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading roster...</p>
            </div>
        );
    }

    if (error || !mapping) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-500/5 rounded-[3rem] border border-dashed border-red-500/20 text-center">
                <X className="w-12 h-12 text-red-300" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Roster not found</h3>
                <button onClick={() => router.back()} className="text-indigo-500 text-sm font-bold hover:underline">Go back</button>
            </div>
        );
    }

    const filteredStudents = mapping.student_details?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.surname.toLowerCase().includes(search.toLowerCase()) ||
        s.gr_no.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-500 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Assignments
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tighter italic uppercase">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 not-italic">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            {mapping.school_class.standard} - {mapping.school_class.division}
                        </h1>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Calendar className="w-3 h-3 text-indigo-500" />
                                {mapping.academic_year} Session
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-lg">
                                <BadgeCheck className="w-3 h-3 text-emerald-500" />
                                {mapping.student_details?.length || 0} Students Enrolled
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-500" : "text-zinc-400 hover:text-zinc-500"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-500" : "text-zinc-400 hover:text-zinc-500"
                        )}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Filter */}
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search roster by student name or GR number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    />
                </div>
            </section>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="group p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden text-center">
                            <div className="w-16 h-16 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <UserCircle className="w-10 h-10 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{student.name} {student.surname}</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">GR: {student.gr_no}</p>
                            <div className="px-3 py-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl inline-block text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-100 dark:border-zinc-800">
                                {student.gender}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in duration-500">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">GR Number</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Student Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Gender</th>
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="group hover:bg-zinc-50/[0.5] dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-xs font-black text-indigo-500">{student.gr_no}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <UserCircle className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{student.name} {student.surname}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">{student.gender}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link
                                            href={`/students/edit?id=${student.id}`}
                                            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                                        >
                                            View Student
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function ClassStudentDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-sm tracking-widest uppercase opacity-70">Synchronizing rosters...</p>
            </div>
        }>
            <ClassStudentDetailContent />
        </Suspense>
    );
}
