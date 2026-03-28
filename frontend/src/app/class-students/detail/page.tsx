'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    Users,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Calendar,
    GraduationCap,
    Clock,
    User
} from 'lucide-react';
import Link from 'next/link';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface Student {
    id: number;
    gr_no: string;
    name: string;
    surname: string;
    gender?: string;
    dob?: string;
    city?: string;
}

interface ClassAssignment {
    id: number;
    academic_year: string;
    class_id: number;
    students: number[];
    school_class?: SchoolClass;
    created_at?: string;
}

function StudentListContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [assignment, setAssignment] = useState<ClassAssignment | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchData = useCallback(async () => {
        if (!id) {
            setError('Missing assignment ID.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const assignmentData = await api.getClassStudentById(id);
            setAssignment(assignmentData);

            if (assignmentData.students && assignmentData.students.length > 0) {
                const studentsData = await api.getStudents({
                    student_ids: assignmentData.students,
                    limit: 1000
                });
                setStudents(studentsData.items);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch assignment details:', err);
            setError('Failed to load student list for this class.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [fetchData, user]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header & Back Button */}
            <div className="flex flex-col gap-6">
                <Link
                    href="/class-students"
                    className="flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors w-fit group"
                >
                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-500/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Back to assignments</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
                                    {assignment?.school_class ? `${assignment.school_class.standard} - ${assignment.school_class.division}` : 'Class List'}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        {assignment?.academic_year}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                        {students.length} Students Assigned
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {assignment?.created_at && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Created {new Date(assignment.created_at).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Content */}
            <div className="bg-white dark:bg-zinc-950 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70 text-zinc-500">Loading student list...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
                        <Users className="w-16 h-16 text-zinc-200 dark:text-zinc-800" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No Students Assigned</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mx-auto">This class mapping exists but currently has no students assigned to it.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">#</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">GR No</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Full Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">DOB</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">City</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {students.map((student, index) => (
                                    <tr key={student.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                                        <td className="px-8 py-5 text-sm font-black text-zinc-300 dark:text-zinc-700 italic">{index + 1}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-indigo-500 tracking-tighter tabular-nums bg-indigo-500/10 px-2 py-1 rounded-lg w-fit">
                                                    {student.gr_no}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{student.name}</span>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{student.surname}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
                                                {student.dob ? new Date(student.dob).toLocaleDateString() : '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                {student.city || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                Enrolled
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Insight */}
            <div className="p-8 rounded-[3rem] bg-indigo-500 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-black tracking-tight italic">Academic Group Success</h4>
                        <p className="text-indigo-100 text-sm font-medium opacity-80">This list is managed by the central administrative authority.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ClassStudentDetailPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="font-bold text-sm tracking-widest uppercase opacity-70 text-zinc-500">Initializing detail view...</p>
                </div>
            }>
                <StudentListContent />
            </Suspense>
        </DashboardLayout>
    );
}
