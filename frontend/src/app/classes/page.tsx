'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    Loader2,
    X,
    BadgeCheck,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmBox } from '@/components/ConfirmBox';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
    class_teacher_id?: number;
    class_teacher?: {
        name: string;
    };
}

interface Staff {
    id: number;
    name: string;
    department: string;
}

export default function ClassesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        standard: '',
        division: '',
        class_teacher_id: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [classesData, staffData] = await Promise.all([
                api.getClasses({ search, limit: 100 }),
                api.getStaff({ department: 'teaching', limit: 100 })
            ]);

            setClasses(classesData);
            setStaff(staffData.items);
        } catch (err: unknown) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load classes or staff information.');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchData();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchData, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                standard: formData.standard,
                division: formData.division,
                class_teacher_id: formData.class_teacher_id ? parseInt(formData.class_teacher_id) : null
            };

            if (editingClass) {
                await api.updateClass(editingClass.id, payload);
            } else {
                await api.addClass(payload);
            }

            setIsAddOpen(false);
            setEditingClass(null);
            setFormData({ standard: '', division: '', class_teacher_id: '' });
            fetchData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save class.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await api.deleteClass(idToDelete);
            fetchData();
            setDeleteConfirmOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete class.';
            setError(msg);
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const triggerDelete = (id: number) => {
        setIdToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const openEdit = (cls: SchoolClass) => {
        setEditingClass(cls);
        setFormData({
            standard: cls.standard,
            division: cls.division,
            class_teacher_id: cls.class_teacher_id?.toString() || ''
        });
        setIsAddOpen(true);
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                {/* Header */}
                <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            Class Management
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage standards, divisions, and class teachers.</p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingClass(null);
                            setFormData({ standard: '', division: '', class_teacher_id: '' });
                            setIsAddOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Class
                    </button>
                </section>

                {/* Filters */}
                <section className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter classes by standard or division..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                    </div>
                </section>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Main Content */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in duration-500">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="font-bold text-sm tracking-widest uppercase opacity-70">Fetching classes...</p>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            <Layers className="w-12 h-12 text-zinc-300" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No classes found</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">Create your first class to start managing student groups.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {classes.map((cls) => (
                                <div key={cls.id} className="group p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                            <span className="text-indigo-600 font-black text-lg">{cls.division}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(cls)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => triggerDelete(cls.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter italic">Standard {cls.standard}</h3>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                            <BadgeCheck className="w-3 h-3 text-emerald-500" />
                                            Division {cls.division}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Class Teacher</span>
                                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                    {cls.class_teacher?.name || 'Not assigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Layers className="w-5 h-5" />
                                </div>
                                {editingClass ? 'Edit Class' : 'Create New Class'}
                            </h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Standard</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 1st, 10th, BSc-IT"
                                        value={formData.standard}
                                        onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Division</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. A, B, Section-1"
                                        value={formData.division}
                                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Class Teacher</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.class_teacher_id}
                                            onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                                        >
                                            <option value="">Select a teacher</option>
                                            {staff.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3.5 rounded-2xl bg-indigo-500 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingClass ? 'Update Class' : 'Create Class')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirm Box */}
            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Delete Class"
                description="Are you sure you want to delete this class? This will also affect student assignments."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Delete"
                variant="danger"
            />
        </DashboardLayout>
    );
}
