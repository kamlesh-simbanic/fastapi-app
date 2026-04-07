'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectAssignments,
    assignTeacher,
    unassignTeacher
} from './actions';
import { getStaff } from '../staff/actions';
import { useAuth } from '@/components/AuthContext';
import {
    BookOpen,
    Plus,
    Search,
    Loader2,
    X,
    AlertCircle,
    UserPlus,
    UserMinus,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmBox } from '@/components/ConfirmBox';
import Table from '@/components/Table';
import { Subject, Assignment } from './types';
import { Staff } from '../staff/types';
import { getSubjectColumns } from './utils';


import { useGlobalData } from '@/context/GlobalContext';

export default function SubjectsPage() {
    const { user } = useAuth();
    const { subjects: allSubjects, loading: globalLoading, refreshSubjects } = useGlobalData();

    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [allStaff, setAllStaff] = useState<Staff[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningTeacherId, setAssigningTeacherId] = useState<string>('');

    // Set initial selected subject once data is loaded
    useEffect(() => {
        if (allSubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(allSubjects[0]);
        }
    }, [allSubjects, selectedSubject]);

    const fetchAssignments = useCallback(async (subjectId: number) => {
        setLoadingAssignments(true);
        try {
            const data = await getSubjectAssignments(subjectId);
            setAssignments(data);
        } catch (err: unknown) {
            console.error('Failed to fetch assignments:', err);
        } finally {
            setLoadingAssignments(false);
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            const data = await getStaff({ limit: 100 });
            setAllStaff(data.items);
        } catch (err: unknown) {
            console.error('Failed to fetch staff:', err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchStaff();
        }
    }, [user, fetchStaff]);

    useEffect(() => {
        if (selectedSubject) {
            fetchAssignments(selectedSubject.id);
        }
    }, [selectedSubject, fetchAssignments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingSubject) {
                await updateSubject(editingSubject.id, formData);
            } else {
                await addSubject(formData);
            }
            setIsAddOpen(false);
            setEditingSubject(null);
            setFormData({ name: '' });
            refreshSubjects();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save subject.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await deleteSubject(idToDelete);
            refreshSubjects();
            setDeleteConfirmOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete subject.';
            setError(msg);
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const openEdit = (sub: Subject) => {
        setEditingSubject(sub);
        setFormData({ name: sub.name });
        setIsAddOpen(true);
    };

    const filteredSubjects = allSubjects.filter((s: Subject) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = async () => {
        if (!selectedSubject || !assigningTeacherId) return;
        setSubmitting(true);
        try {
            await assignTeacher({
                subject_id: selectedSubject.id,
                teacher_id: parseInt(assigningTeacherId)
            });
            fetchAssignments(selectedSubject.id);
            setAssigningTeacherId('');
            setIsAssignModalOpen(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to assign teacher');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnassign = async (assignmentId: number) => {
        if (!selectedSubject) return;
        try {
            await unassignTeacher(assignmentId);
            fetchAssignments(selectedSubject.id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to unassign teacher');
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        Subject Management
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Create and manage academic subjects.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingSubject(null);
                        setFormData({ name: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </section>

            {/* Filters */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] items-start">
                {/* Left Panel: Subjects */}
                <div className={cn(
                    "w-full lg:w-1/2 space-y-6 transition-all duration-500 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar",
                    globalLoading.subjects ? "opacity-50 pointer-events-none" : "opacity-100"
                )}>
                    {globalLoading.subjects ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading subjects...</p>
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            <BookOpen className="w-12 h-12 text-zinc-300" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No subjects found</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">Create subjects to start assigning them to teachers.</p>
                        </div>
                    ) : (
                        <Table
                            columns={getSubjectColumns({
                                selectedSubjectId: selectedSubject?.id,
                                onViewTeachers: setSelectedSubject,
                                onEdit: openEdit,
                                onDelete: (id) => { setIdToDelete(id); setDeleteConfirmOpen(true); }
                            })}
                            data={filteredSubjects}
                            loading={globalLoading.subjects}
                            emptyMessage="No subjects found matching your search."
                        />
                    )}
                </div>

                {/* Right Panel: Assigned Teachers */}
                <div className="w-full lg:w-1/2 animate-in slide-in-from-right-4 duration-500 sticky top-8">
                    {selectedSubject ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                            {/* Panel Header */}
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                                            Assigned Teachers
                                        </div>
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight italic flex items-center gap-3">
                                            {selectedSubject.name}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Assign New
                                    </button>
                                </div>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 p-8">
                                {loadingAssignments ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="font-bold text-[10px] uppercase tracking-widest">Loading assignments...</p>
                                    </div>
                                ) : assignments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                            <UserPlus className="w-8 h-8 text-zinc-300" />
                                        </div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg">No teachers assigned</h3>
                                        <p className="text-zinc-500 text-sm max-w-[240px]">Start by assigning a teacher to this subject.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {assignments.map((as) => (
                                            <div key={as.id} className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold uppercase">
                                                        {as.teacher?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-zinc-900 dark:text-white italic tracking-tight">{as.teacher?.name}</h4>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{as.teacher?.department || 'Teacher'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnassign(as.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Unassign"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <span>Total Assigned</span>
                                    <span className="bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-indigo-500">
                                        {assignments.length} Teachers
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-12 text-center text-zinc-400">
                            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold text-sm tracking-widest uppercase opacity-50">Select a subject to view assignments</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Subject Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    placeholder="Enter subject name..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 rounded-2xl bg-indigo-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingSubject ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Delete Subject"
                description="Are you sure you want to delete this subject? This might affect teacher assignments."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                variant="danger"
                confirmText="Delete"
            />

            {/* Assign Teacher Dialog */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <UserPlus className="w-5 h-5 text-indigo-500" />
                                Assign Teacher
                            </h2>
                            <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors font-bold"><X className="w-5 h-5 font-bold" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block font-bold">Select Teacher</label>
                                <div className="relative">
                                    <select
                                        value={assigningTeacherId}
                                        onChange={(e) => setAssigningTeacherId(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose a staff member...</option>
                                        {allStaff
                                            .filter(s => !assignments.some(a => a.teacher_id === s.id))
                                            .map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.department || 'No Dept'})</option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest font-bold grayscale hover:grayscale-0 transition-all">Cancel</button>
                                <button
                                    onClick={handleAssign}
                                    disabled={submitting || !assigningTeacherId}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-indigo-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all font-bold"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
