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

                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
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

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading subjects...</p>
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <BookOpen className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No subjects found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">Create subjects to start assigning them to teachers.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSubjects.map((sub) => (
                            <div key={sub.id} className="group p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(sub)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => { setIdToDelete(sub.id); setDeleteConfirmOpen(true); }} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight italic mb-6">{sub.name}</h3>

                                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <Link
                                        href={`/subjects/assign?subjectId=${sub.id}`}
                                        className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 text-xs font-black uppercase tracking-widest transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Assign Teachers
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Subject Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {filteredSubjects.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-zinc-50/[0.5] dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{sub.name}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    href={`/subjects/assign?subjectId=${sub.id}`}
                                                    className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all"
                                                    title="Assign Teachers"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => openEdit(sub)} className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => { setIdToDelete(sub.id); setDeleteConfirmOpen(true); }} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
        </div>
    );
}
