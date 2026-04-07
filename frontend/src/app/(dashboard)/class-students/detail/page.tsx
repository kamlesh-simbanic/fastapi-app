'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClassStudentById } from '../actions';
import { ClassStudent } from '../types';
import { useAuth } from '@/components/AuthContext';
import {
    ArrowLeft,
    Loader2,
    Calendar,
    GraduationCap,
    Clock,
    CheckCircle2,
    LayoutGrid,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';

function DetailContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const mappingId = searchParams.get('id');
    const [mapping, setMapping] = useState<ClassStudent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!mappingId) return;
            try {
                const data = await getClassStudentById(parseInt(mappingId));
                setMapping(data);
            } catch (err: unknown) {
                console.error('Failed to fetch detail:', err);
                setError('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDetail();
    }, [mappingId, user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading details...</p>
            </div>
        );
    }

    if (error || !mapping) {
        return (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800">
                <p className="text-red-500 font-bold">{error || 'Assignment not found'}</p>
                <Link href="/class-students" className="mt-4 inline-flex items-center gap-2 text-indigo-500 font-bold hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/class-students" className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors text-xs font-bold uppercase tracking-widest mb-2">
                        <ArrowLeft className="w-3 h-3" /> Back to assignments
                    </Link>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic">
                        {mapping.school_class?.standard} - {mapping.school_class?.division}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-500/20">
                            {mapping.academic_year}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            <BookOpen className="w-3 h-3 text-indigo-500" />
                            {mapping.students?.length || 0} Students Assigned
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Class</p>
                    <h4 className="text-xl font-black text-zinc-900 dark:text-white">{mapping.school_class?.standard}</h4>
                </div>
                <div className="p-6 rounded-[2rem] bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Division</p>
                    <h4 className="text-xl font-black">{mapping.school_class?.division}</h4>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Session</p>
                    <h4 className="text-xl font-black text-zinc-900 dark:text-white">{mapping.academic_year}</h4>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                    <h4 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        Active <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                    </h4>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Student Roster</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/30">
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ID / Roll No</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Student Details</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {mapping.students?.map((studentId: number) => (
                                <tr key={studentId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-8 py-6 font-mono text-xs font-black text-indigo-500">#{studentId}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">Student {studentId}</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest underline decoration-indigo-500/30">Primary Enrollment</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Regular</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Verified</div>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
