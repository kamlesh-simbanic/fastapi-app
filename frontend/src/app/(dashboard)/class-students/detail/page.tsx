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
    X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Student {
    id: number;
    name: string;
    surname: string;
    gr_no: string;
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
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [search, setSearch] = useState('');

    const fetchDetail = useCallback(async () => {
        if (!mappingId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.getClassStudentById(parseInt(mappingId));
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
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in">
                <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                <div className="text-center">
                    <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Cataloging Roster Data...</p>
                    <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Accessing Institutional Database</p>
                </div>
            </div>
        );
    }

    if (error || !mapping) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-8 bg-red-50 dark:bg-red-950/20 rounded-radius-large border border-dashed border-red-200 dark:border-red-900/30 text-center animate-in scale-in-95">
                <div className="w-24 h-24 rounded-radius-large bg-surface-paper dark:bg-zinc-800 border border-red-100 dark:border-red-900/40 flex items-center justify-center shadow-inner">
                    <X className="w-12 h-12 text-error shadow-2xl shadow-error/20" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight uppercase">Registry Access Failure</h3>
                    <p className="text-zinc-500 text-sm font-medium italic opacity-70 uppercase tracking-widest text-[10px] max-w-xs mx-auto">The requested academic allocation record could not be located in the central database.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark transition-all shadow-2xl shadow-primary-main/20 active:scale-95 italic"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    const filteredStudents = mapping.student_details?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.surname.toLowerCase().includes(search.toLowerCase()) ||
        s.gr_no.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-8 flex-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-primary-main uppercase tracking-[0.4em] transition-all group italic"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                        Back to Allocations
                    </button>

                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white flex items-center gap-4 italic tracking-tight uppercase">
                                    {mapping.school_class.standard} &ndash; {mapping.school_class.division}
                                </h1>
                                <p className="text-primary-main/60 font-black text-[10px] uppercase tracking-[0.3em] italic">Cohort Roster Overview</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 px-5 py-2 bg-surface-paper dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-radius-medium shadow-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                                <Calendar className="w-4 h-4 text-primary-main" />
                                {mapping.academic_year} Session
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2 bg-primary-main text-white rounded-radius-medium shadow-2xl shadow-primary-main/20 text-[10px] font-black uppercase tracking-widest italic ring-4 ring-primary-main/5">
                                <BadgeCheck className="w-4 h-4" />
                                {mapping.student_details?.length || 0} Members Enrolled
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-surface-ground dark:bg-zinc-800 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 shadow-inner self-end relative z-10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Toolbar */}
            <section className="bg-surface-paper dark:bg-zinc-900 p-8 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative group z-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary-main transition-colors pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search roster by member name or admission ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-5 pl-16 pr-8 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-white italic uppercase placeholder:opacity-30 placeholder:normal-case tracking-wider"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>

            {/* Registry View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="group p-10 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/40 transition-all hover:shadow-2xl hover:shadow-primary-main/5 relative overflow-hidden text-center flex flex-col items-center">
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-32 h-32 bg-primary-main/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            </div>

                            <div className="w-20 h-20 rounded-radius-large bg-surface-ground dark:bg-zinc-800 border border-zinc-50 dark:border-zinc-700 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:bg-primary-main group-hover:text-white transition-all duration-500">
                                <UserCircle className="w-12 h-12 text-zinc-100 dark:text-zinc-700 group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 italic uppercase group-hover:text-primary-main transition-colors">{student.name} {student.surname}</h3>
                            <p className="text-[10px] font-black text-primary-main uppercase tracking-[0.3em] mb-8 italic">Admission force: {student.gr_no}</p>

                            <Link
                                href={`/students/edit?id=${student.id}`}
                                className="mt-auto w-full py-3 bg-surface-ground dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-radius-medium text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-main hover:text-white transition-all shadow-sm active:scale-95 italic border border-zinc-50 dark:border-zinc-700 group-hover:border-primary-main/20"
                            >
                                Inspect Profile
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-surface-ground">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Admission Force ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Student Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 text-right italic">Registry Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="group hover:bg-zinc-50/[0.3] dark:hover:bg-zinc-800/30 transition-all border-b border-zinc-50 dark:border-zinc-800 last:border-0 text-zinc-900 dark:text-zinc-100 uppercase">
                                        <td className="px-10 py-7">
                                            <div className="inline-flex px-4 py-2 bg-primary-main/5 border border-primary-main/10 text-primary-main rounded-radius-medium font-black text-xs italic tracking-[0.2em] shadow-sm transform group-hover:scale-105 transition-transform">
                                                {student.gr_no}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 flex items-center justify-center border border-zinc-50 dark:border-zinc-700 group-hover:bg-primary-main group-hover:text-white transition-all duration-300 shadow-inner">
                                                    <UserCircle className="w-7 h-7 text-zinc-100 dark:text-zinc-700 group-hover:text-white" />
                                                </div>
                                                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic group-hover:text-primary-main transition-colors">{student.name} {student.surname}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <Link
                                                href={`/students/edit?id=${student.id}`}
                                                className="px-6 py-3 bg-primary-main/5 text-primary-main rounded-radius-medium text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-main hover:text-white transition-all transform active:scale-95 shadow-sm inline-block italic border border-primary-main/10"
                                            >
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="py-32 text-center space-y-6 bg-surface-ground/30">
                            <div className="w-20 h-20 rounded-radius-large bg-surface-paper dark:bg-zinc-800 mx-auto flex items-center justify-center border border-zinc-50 dark:border-zinc-700 shadow-inner">
                                <Search className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-zinc-500 font-black italic text-[10px] uppercase tracking-[0.3em]">Zero Matches Found</p>
                                <p className="text-zinc-400 font-medium italic text-[9px] uppercase tracking-widest opacity-60">No members matching your search criteria in this unit roster.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ClassStudentDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in">
                <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                <div className="space-y-1 text-center">
                    <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-80 italic">Cataloging Roster...</p>
                    <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Synchronizing student registry data</p>
                </div>
            </div>
        }>
            <ClassStudentDetailContent />
        </Suspense>
    );
}
