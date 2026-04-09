'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ClassStudent } from '../types';
import { Student } from '../../students/types';
import { STUDENT_COLUMNS } from '../../students/utils';
import { useAuth } from '@/context/AuthContext';
import {
    ArrowLeft,
    Loader2,
    Calendar,
    GraduationCap,
    Clock,
    LayoutGrid,
    BookOpen,
    ChevronDown,
    Plus,
    AlertCircle
} from 'lucide-react';
import Table from '@/components/Table';

function DetailContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const yearParam = searchParams.get('year') || '2025-26';

    const [mapping, setMapping] = useState<ClassStudent | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [academicYear, setAcademicYear] = useState(yearParam);

    const fetchDetail = async (targetId: string, targetYear: string) => {
        setLoading(true);
        setError(null);
        try {
            let currentMapping: ClassStudent | null = null;

            // First, try to fetch as a direct Mapping ID
            try {
                const data = await api.getClassStudentById(parseInt(targetId));
                if (data && data.class_id.toString() === targetId) {
                    currentMapping = data;
                }
            } catch {
                // Ignore and try class lookup
            }

            if (!currentMapping) {
                // Try to fetch by Class ID and Year
                const classData = await api.getClassStudents({
                    class_id: parseInt(targetId),
                    academic_year: targetYear
                });

                if (classData.items && classData.items.length > 0) {
                    currentMapping = classData.items[0];
                }
            }

            if (currentMapping) {
                setMapping(currentMapping);
                // Fetch full student details
                if (currentMapping.students && currentMapping.students.length > 0) {
                    setLoadingStudents(true);
                    try {
                        const studentsData = await api.getStudents({ id: currentMapping.students, limit: 1000 });
                        setStudents(studentsData.items || []);
                    } catch (studentErr) {
                        console.error('Failed to fetch students:', studentErr);
                    } finally {
                        setLoadingStudents(false);
                    }
                } else {
                    setStudents([]);
                }
            } else {
                setMapping(null);
                setStudents([]);
                setError('No student assignments found for this class and year.');
            }
        } catch (err: unknown) {
            console.error('Failed to fetch detail:', err);
            setError('Failed to load assignment details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && id) {
            fetchDetail(id, academicYear);
        }
    }, [id, academicYear, user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-xs uppercase tracking-widest opacity-70 italic tracking-[0.2em]">Synchronizing roster...</p>
            </div>
        );
    }

    if (error || !mapping) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Back
                    </button>

                    <div className="relative group">
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 pr-10 text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="2024-25">2024-25</option>
                            <option value="2025-26">2025-26</option>
                            <option value="2026-27">2026-27</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm border-dashed">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">No Assignments Found</h3>
                    <p className="text-zinc-500 text-sm font-medium max-w-xs mx-auto mb-8">{error || 'There are no students assigned to this class for the selected academic year.'}</p>
                    <button className="px-8 py-3 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 mx-auto">
                        <Plus className="w-4 h-4" /> Create Assignment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <button onClick={() => router.push('/classes')} className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors text-xs font-bold uppercase tracking-widest mb-2 active:scale-95 transition-all">
                        <ArrowLeft className="w-3 h-3" /> Back to classes
                    </button>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white italic font-black">
                            {mapping.school_class?.standard.charAt(0)}
                        </div>
                        {mapping.school_class?.standard} - {mapping.school_class?.division}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-500/20 shadow-sm">
                            {mapping.academic_year}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            {mapping.students?.length || 0} Students Assigned
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <label className="absolute -top-3 left-3 bg-white dark:bg-zinc-950 px-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 z-10">Switch Year</label>
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="appearance-none bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-3.5 pr-12 text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-xl shadow-zinc-200/20"
                    >
                        <option value="2024-25">Academic Year: 2024-25</option>
                        <option value="2025-26">Academic Year: 2025-26</option>
                        <option value="2026-27">Academic Year: 2026-27</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-indigo-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Standard</p>
                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight">{mapping.school_class?.standard}</h4>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 border-4 border-indigo-400/20 group hover:scale-[1.02] transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                        <LayoutGrid className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Division</p>
                    <h4 className="text-2xl font-black italic tracking-tight">{mapping.school_class?.division}</h4>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-emerald-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Session</p>
                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight">{mapping.academic_year}</h4>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-zinc-900 dark:bg-black border border-zinc-800 shadow-2xl group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Registry</p>
                        <h4 className="text-2xl font-black text-white italic tracking-tight flex items-center gap-3">
                            Active <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                        </h4>
                    </div>
                </div>
            </div>

            {/* Students List Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Class Roster</h3>
                    <button className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-400 hover:text-indigo-500 transition-all active:scale-95 shadow-sm">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <Table
                    columns={STUDENT_COLUMNS}
                    data={students}
                    loading={loadingStudents}
                    emptyMessage="No students assigned for the selected year."
                />
            </div>
        </div>
    );
}

export default function ClassStudentDetail() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        }>
            <DetailContent />
        </Suspense>
    );
}
