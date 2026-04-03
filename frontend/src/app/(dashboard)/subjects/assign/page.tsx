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
import { cn } from '@/lib/utils';

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
        <div className="p-12 text-center bg-surface-ground rounded-radius-large border border-dashed border-red-500/30 flex flex-col items-center gap-6 animate-in slide-in-from-top-4">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-error shadow-inner">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tight">Unrecognized Discipline</h3>
                <p className="text-sm font-medium text-zinc-500 italic opacity-70">The system could not identify the requested academic subject record.</p>
            </div>
            <button onClick={() => router.push('/subjects')} className="mt-4 px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-primary-main/20 active:scale-95 italic">Return to Registry</button>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in">
            <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
            <div className="text-center">
                <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Cataloging Assignment Records...</p>
                <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Accessing Institutional Database</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex items-center gap-8">
                <button
                    onClick={() => router.push('/subjects')}
                    className="p-4 bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium hover:bg-white dark:hover:bg-zinc-800 hover:border-primary-main/30 transition-all shadow-sm active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-primary-main transition-colors" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white tracking-tight flex flex-wrap items-center gap-3 italic">
                        Faculty Allocation: <span className="text-primary-main opacity-80 decoration-primary-main/30 underline underline-offset-8">{subject?.name}</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic opacity-70 uppercase tracking-widest text-[10px]">Deploy specialized faculty members to this discipline.</p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Assignment Form */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-10 bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <UserPlus className="w-32 h-32 text-primary-main" />
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-radius-medium bg-primary-main/10 text-primary-main flex items-center justify-center border border-primary-main/20 shadow-inner">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight italic">Link Faculty</h2>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Assign Member</p>
                            </div>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] ml-1 italic">Faculty Member</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 group-focus-within:text-primary-main transition-colors pointer-events-none" />
                                    <select
                                        required
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                        className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 pl-14 pr-10 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all cursor-pointer appearance-none text-zinc-900 dark:text-white italic placeholder:opacity-30"
                                    >
                                        <option value="">Select teaching personnel...</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !selectedTeacher}
                                className="w-full py-5 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark shadow-2xl shadow-primary-main/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 italic ring-4 ring-primary-main/5"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        Establish Deployment
                                        <CheckCircle2 className="w-4.5 h-4.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="p-5 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center gap-4 text-error animate-in shake duration-300 shadow-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-tight">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col relative">
                        <div className="p-10 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-surface-ground">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-radius-medium bg-success/10 text-success flex items-center justify-center border border-success/20 shadow-inner">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight italic">Active Instructors</h2>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Linked Personnel</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-radius-medium shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] italic">
                                    {assignments.length.toString().padStart(2, '0')} Members
                                </span>
                            </div>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-8 text-center animate-in fade-in duration-700">
                                <div className="w-24 h-24 rounded-radius-large bg-surface-ground border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-inner">
                                    <User className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight">Personnel Roster Empty</h3>
                                    <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed italic opacity-70">No instructors have been linked to this discipline yet. Begin by selecting a member from the left panel to establish deployment.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {assignments.map((a) => (
                                    <div key={a.id} className="p-8 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 flex items-center justify-between transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-radius-large bg-primary-main/5 border border-primary-main/10 flex items-center justify-center group-hover:bg-primary-main group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-2 duration-300 shadow-sm overflow-hidden relative">
                                                <User className="w-8 h-8 text-primary-main group-hover:text-white transition-colors relative z-10" />
                                                <div className="absolute inset-0 bg-primary-main opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none group-hover:text-primary-main group-hover:italic transition-all uppercase">{a.teacher?.name || 'Unknown Faculty'}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em] italic">Teaching Faculty</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                                    <span className="text-[9px] font-black text-success uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Deploy Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setIdToDelete(a.id); setDeleteConfirmOpen(true); }}
                                            className="p-4 text-zinc-200 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 rounded-radius-medium transition-all opacity-0 group-hover:opacity-100 active:scale-90 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 shadow-sm"
                                            title="Dissolve Deployment"
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
                title="Decommission Faculty Link"
                description={`Warning: Are you certain you wish to dissolve this instructor's deployment from ${subject?.name}? This will revoke their teaching authorization for this discipline in the institutional record.`}
                onConfirm={handleUnassign}
                onCancel={() => setDeleteConfirmOpen(false)}
                variant="danger"
                confirmText="Execute Decommission"
            />
        </div>
    );
}

export default function AssignTeacherPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500">
                <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                <div className="text-center">
                    <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Booting Deployment Logic...</p>
                    <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Please Wait</p>
                </div>
            </div>
        }>
            <AssignContent />
        </Suspense>
    );
}
