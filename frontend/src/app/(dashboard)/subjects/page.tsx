'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    X,
    LayoutGrid,
    List,
    AlertCircle,
    UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmBox } from '@/components/ConfirmBox';
import Link from 'next/link';

interface Subject {
    id: number;
    name: string;
}

export default function SubjectsPage() {
    const { user } = useAuth();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getSubjects();
            setSubjects(data);
        } catch (err: unknown) {
            console.error('Failed to fetch subjects:', err);
            setError('Failed to load subjects.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchSubjects();
        }
    }, [fetchSubjects, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingSubject) {
                await api.updateSubject(editingSubject.id, formData);
            } else {
                await api.addSubject(formData);
            }
            setIsAddOpen(false);
            setEditingSubject(null);
            setFormData({ name: '' });
            fetchSubjects();
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
            await api.deleteSubject(idToDelete);
            fetchSubjects();
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

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-h2 font-weight-h2 tracking-tight text-zinc-900 dark:text-white flex items-center gap-3 italic">
                        <div className="w-12 h-12 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-lg shadow-primary-main/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        Academic Disciplines
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic opacity-70">Define and organize the curriculum subjects.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingSubject(null);
                        setFormData({ name: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-6 py-3 bg-primary-main text-white rounded-radius-medium text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary-dark shadow-xl shadow-primary-main/20 active:scale-95 transition-all flex items-center gap-2 italic"
                >
                    <Plus className="w-4 h-4" />
                    Define New Subject
                </button>
            </section>

            {/* Toolbar */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary-main transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter disciplines..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all shadow-sm font-bold italic placeholder:opacity-50"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 p-1 bg-surface-ground dark:bg-zinc-800 rounded-radius-medium border border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary-main" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary-main" : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-radius-medium bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-error animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold tracking-tight italic">{error}</p>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-primary-main animate-spin" />
                        <div className="text-center">
                            <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Cataloging Disciplines...</p>
                            <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase">Fetching Institutional Curriculum</p>
                        </div>
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-8 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-500">
                        <div className="w-20 h-20 rounded-radius-large bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                            <BookOpen className="w-10 h-10 text-primary-main opacity-30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tight">Curriculum Registry Empty</h3>
                            <p className="text-zinc-500 text-sm max-w-xs font-medium leading-relaxed italic opacity-70">Begin by defining your first academic discipline to start assigning teaching staff.</p>
                        </div>
                        <button
                            onClick={() => setSearch('')}
                            className="text-primary-main font-bold text-[10px] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity border-b-2 border-primary-main/30 pb-1 italic"
                        >
                            Reset Parameter Filter
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredSubjects.map((sub) => (
                            <div key={sub.id} className="group p-8 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/30 transition-all hover:shadow-2xl hover:shadow-primary-main/5 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-1">
                                    <div className="w-24 h-24 bg-primary-main/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary-main/10 transition-colors blur-2xl" />
                                </div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-12 h-12 rounded-radius-medium bg-primary-main/10 flex items-center justify-center border border-primary-main/20 shadow-inner">
                                        <BookOpen className="w-6 h-6 text-primary-main" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(sub)} className="p-2.5 text-zinc-400 hover:text-primary-main hover:bg-primary-main/5 rounded-radius-medium transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => { setIdToDelete(sub.id); setDeleteConfirmOpen(true); }} className="p-2.5 text-zinc-400 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 rounded-radius-medium transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-8 relative z-10 group-hover:italic group-hover:text-primary-main transition-all">{sub.name}</h3>

                                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
                                    <Link
                                        href={`/subjects/assign?subjectId=${sub.id}`}
                                        className="flex items-center justify-between group/link"
                                    >
                                        <span className="text-primary-main text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                            <UserPlus className="w-4 h-4" />
                                            Assign Teachers
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-primary-main/10 flex items-center justify-center group-hover/link:bg-primary-main group-hover/link:text-white group-hover/link:shadow-lg group-hover/link:shadow-primary-main/20 transition-all text-primary-main">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-surface-ground">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Discipline Nomenclature</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 text-right italic">Registry Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {filteredSubjects.map((sub) => (
                                        <tr key={sub.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-radius-medium bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                                                        <BookOpen className="w-5 h-5 text-primary-main opacity-60" />
                                                    </div>
                                                    <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider italic group-hover:text-primary-main transition-colors">{sub.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/subjects/assign?subjectId=${sub.id}`}
                                                        className="p-3 bg-primary-main/5 text-primary-main rounded-radius-medium hover:bg-primary-main hover:text-white transition-all shadow-sm"
                                                        title="Deploy Staff"
                                                    >
                                                        <UserPlus className="w-4.5 h-4.5" />
                                                    </Link>
                                                    <button onClick={() => openEdit(sub)} className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-main rounded-radius-medium hover:bg-white dark:hover:bg-zinc-700 transition-all shadow-sm"><Edit2 className="w-4.5 h-4.5" /></button>
                                                    <button onClick={() => { setIdToDelete(sub.id); setDeleteConfirmOpen(true); }} className="p-3 bg-red-50 dark:bg-red-950/20 text-red-300 hover:text-error rounded-radius-medium hover:bg-white dark:hover:bg-red-900/10 transition-all shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
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

            {/* Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-paper dark:bg-zinc-900 w-full max-w-sm rounded-radius-large border border-primary-main/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tight">{editingSubject ? 'Update Registry' : 'Establish Discipline'}</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-all"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-10 relative z-10">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] ml-1 italic">Discipline Name</label>
                                <input
                                    required
                                    type="text"
                                    autoFocus
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-white italic placeholder:opacity-30"
                                    placeholder="e.g. ADVANCED CALCULUS"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <button type="submit" disabled={submitting} className="w-full py-5 rounded-radius-medium bg-primary-main text-white text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary-main/20 active:scale-95 disabled:opacity-50 italic ring-4 ring-primary-main/5">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingSubject ? 'Update Core Record' : 'Establish Discipline')}
                                </button>
                                <button type="button" onClick={() => setIsAddOpen(false)} className="w-full py-5 rounded-radius-medium bg-surface-ground dark:bg-zinc-950 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em] hover:text-zinc-900 dark:hover:text-white transition-all italic">Abort Command</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Decommission Discipline"
                description={`Verification required: Are you certain you wish to purge this academic discipline from the registry? Associated teacher assignments will be permanently decommissioned.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                variant="danger"
                confirmText="Execute Decommission"
            />
        </div>
    );
}
