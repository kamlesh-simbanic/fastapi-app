'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    UserPlus,
    ArrowLeft,
    Loader2,
    Trash2,
    User,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { ConfirmBox } from '@/components/ConfirmBox';

interface Subject {
    id: number;
    name: string;
}

interface Staff {
    id: number;
    name: string;
    department: string;
}

interface TeacherSubject {
    id: number;
    subject_id: number;
    teacher_id: number;
    teacher?: Staff;
}

function AssignContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const subjectId = searchParams.get('subjectId');

    const [subject, setSubject] = useState<Subject | null>(null);
    const [assignments, setAssignments] = useState<TeacherSubject[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState('');

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!subjectId) return;
        setLoading(true);
        setError(null);
        try {
            const [subjectsData, allStaffData] = await Promise.all([
                api.getSubjects(),
                api.getStaff({ limit: 1000 })
            ]);

            const currentSubject = subjectsData.find((s: Subject) => s.id.toString() === subjectId);
            if (!currentSubject) {
                setError('Subject not found.');
                return;
            }
            setSubject(currentSubject);
            setStaff(allStaffData.items.filter((s: Staff) => s.department === 'teaching'));

            const assignmentsData = await api.getSubjectAssignments(subjectId);
            setAssignments(assignmentsData);
        } catch (err: unknown) {
            console.error('Failed to fetch assignment data:', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, [subjectId]);

    useEffect(() => {
        if (user && subjectId) {
            fetchData();
        }
    }, [fetchData, user, subjectId]);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !subjectId) return;

        setSubmitting(true);
        setError(null);
        try {
            await api.assignTeacher({
                subject_id: parseInt(subjectId),
                teacher_id: parseInt(selectedTeacher)
            });
            setSelectedTeacher('');
            fetchData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to assign teacher.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnassign = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await api.unassignTeacher(idToDelete);
            fetchData();
            setDeleteConfirmOpen(false);
        } catch (err: unknown) {
            console.error('Failed to remove assignment:', err);
            setError('Failed to remove assignment.');
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    if (!subjectId) return (
        <div className="p-8 text-center bg-red-50 text-red-500 rounded-2xl border border-red-100 font-bold">
            Invalid Subject ID
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading assignment details...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tight flex items-center gap-3">
                        Assign Teachers to {subject?.name}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Link faculty members to this subject for scheduling and reports.</p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assignment Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">New Assignment</h2>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Teacher / Faculty</label>
                                <select
                                    required
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="">Select a teacher</option>
                                    {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !selectedTeacher}
                                className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Teacher'}
                            </button>
                        </form>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-[10px] font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned Teachers List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <User className="w-5 h-5" />
                                </div>
                                Assigned Faculty
                            </h2>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest tracking-widest">
                                {assignments.length} Assigned
                            </span>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                    <User className="w-8 h-8 text-zinc-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-zinc-900 dark:text-white">No teachers assigned</h3>
                                    <p className="text-zinc-500 text-xs font-medium max-w-[200px]">Use the form on the left to add your first assignment.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {assignments.map((a) => (
                                    <div key={a.id} className="p-6 hover:bg-zinc-50 flex items-center justify-between transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{a.teacher?.name || 'Unknown Teacher'}</h4>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active Assignment
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setIdToDelete(a.id); setDeleteConfirmOpen(true); }}
                                            className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Remove Assignment"
                description="Are you sure you want to remove this teacher from this subject?"
                onConfirm={handleUnassign}
                onCancel={() => setDeleteConfirmOpen(false)}
                variant="danger"
            />
        </div>
    );
}

export default function AssignTeacherPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-sm tracking-widest uppercase opacity-70">Initializing...</p>
            </div>
        }>
            <AssignContent />
        </Suspense>
    );
}
