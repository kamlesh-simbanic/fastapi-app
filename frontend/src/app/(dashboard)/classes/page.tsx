'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
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
    AlertCircle,
    LayoutGrid,
    List
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    const { user } = useAuth();

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [classesData, staffData] = await Promise.all([
                api.getClasses({ search, skip: (page - 1) * pageSize, limit: pageSize }),
                api.getStaff({ limit: 200 })
            ]);

            setClasses(classesData.items);
            setTotal(classesData.total);
            setStaff(staffData.items);
        } catch (err: unknown) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load classes or staff information.');
        } finally {
            setLoading(false);
        }
    }, [search, page, pageSize]);

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

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-zinc-100 flex items-center gap-4 italic tracking-tight">
                        <div className="p-3 rounded-radius-medium bg-primary-main shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        Academic Units
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic opacity-70 uppercase tracking-widest text-[10px]">Configure standards, sections, and assigned leadership.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingClass(null);
                        setFormData({ standard: '', division: '', class_teacher_id: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark shadow-2xl shadow-primary-main/20 active:scale-95 transition-all flex items-center gap-3 italic ring-4 ring-primary-main/5"
                >
                    <Plus className="w-4 h-4" />
                    Initialize Class
                </button>
            </section>

            {/* Toolbar */}
            <section className="flex flex-col sm:flex-row items-center gap-4 bg-surface-paper dark:bg-zinc-900/50 p-2 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 group-focus-within:text-primary-main transition-colors pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search standard or division..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-none rounded-radius-medium py-3.5 pl-14 pr-12 text-sm focus:outline-none focus:ring-0 transition-all text-zinc-900 dark:text-zinc-100 font-black italic uppercase tracking-wider placeholder:opacity-30 placeholder:normal-case"
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

                <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1 opacity-50" />

                <div className="flex items-center gap-1 p-1 bg-surface-ground dark:bg-zinc-800/50 rounded-radius-medium self-stretch border border-zinc-200/50 dark:border-zinc-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'grid'
                                ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main italic scale-105"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'list'
                                ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main italic scale-105"
                                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-5 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center gap-4 text-error animate-in slide-in-from-top-2 shadow-sm italic">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in">
                        <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                        <div className="text-center">
                            <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Cataloging Units...</p>
                            <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Accessing Institutional Database</p>
                        </div>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in scale-in-95">
                        <div className="p-6 bg-surface-paper dark:bg-zinc-800 rounded-radius-large shadow-inner border border-zinc-100 dark:border-zinc-700">
                            <Layers className="w-12 h-12 text-zinc-200 dark:text-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight">Academic Units Registry Empty</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed italic opacity-70 uppercase tracking-widest text-[10px]">Execute &quot;Initialize Class&quot; to begin building the institutional infrastructure.</p>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-6 duration-700">
                        {classes.map((cls) => (
                            <div key={cls.id} className="group p-8 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/40 transition-all hover:shadow-2xl hover:shadow-primary-main/5 relative flex flex-col overflow-hidden">
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-32 h-32 bg-primary-main/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                </div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-14 h-14 rounded-radius-medium bg-primary-main/5 dark:bg-primary-main/10 flex items-center justify-center border border-primary-main/10 shadow-inner group-hover:bg-primary-main group-hover:text-white transition-all duration-500">
                                        <span className="font-black text-xl italic group-hover:scale-110 transition-transform">{cls.division}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                                        <button
                                            onClick={() => openEdit(cls)}
                                            className="p-3 text-zinc-400 hover:text-primary-main bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90"
                                        >
                                            <Edit2 className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                            onClick={() => triggerDelete(cls.id)}
                                            className="p-3 text-zinc-400 hover:text-error bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8 relative z-10">
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase group-hover:text-primary-main transition-colors">Unit {cls.standard}</h3>
                                    <div className="flex items-center gap-2.5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                                        <BadgeCheck className="w-4 h-4 text-success opacity-80" />
                                        Division {cls.division}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-ground border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                            <User className="w-5 h-5 text-zinc-200 dark:text-zinc-700 group-hover:text-primary-main transition-colors" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.2em] italic">Head Instructor</span>
                                            <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 truncate italic hover:text-zinc-900 dark:hover:text-white transition-colors uppercase">
                                                {cls.class_teacher?.name || 'Vacant Selection'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in duration-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-surface-ground">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Academic Standard</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Division Registry</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Head Instructor</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 text-right italic">Unit Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {classes.map((cls) => (
                                        <tr key={cls.id} className="group hover:bg-zinc-50/[0.3] dark:hover:bg-zinc-800/30 transition-all">
                                            <td className="px-10 py-7">
                                                <span className="text-sm font-black text-zinc-900 dark:text-white uppercase italic group-hover:text-primary-main transition-colors">
                                                    Standard {cls.standard}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="inline-flex items-center px-4 py-1.5 bg-primary-main/5 dark:bg-primary-main/10 rounded-radius-medium text-primary-main font-black text-xs italic tracking-widest border border-primary-main/10">
                                                    {cls.division}
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-surface-ground flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                        <User className="w-5 h-5 text-zinc-200 dark:text-zinc-700 group-hover:text-primary-main transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-black text-zinc-600 dark:text-zinc-400 italic group-hover:text-zinc-900 dark:hover:text-white transition-colors uppercase">
                                                        {cls.class_teacher?.name || 'Vacant Selection'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                                                    <button
                                                        onClick={() => openEdit(cls)}
                                                        className="p-3 text-zinc-400 hover:text-primary-main bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Edit2 className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerDelete(cls.id)}
                                                        className="p-3 text-zinc-400 hover:text-error bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
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

            {/* Add/Edit Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-paper dark:bg-zinc-950 w-full max-w-md rounded-radius-large border border-primary-main/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-main/5 rounded-full -mr-20 -mt-20 blur-3xl" />

                        <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-surface-ground/50 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-radius-medium bg-primary-main shadow-xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tight uppercase leading-none">
                                        {editingClass ? 'Update Registry' : 'Initialize Unit'}
                                    </h2>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Core Academic Infrastructure</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddOpen(false)}
                                className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 relative z-10">
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 italic">Academic Standard / Level</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. GRADE 10, SCIENCE WING"
                                        value={formData.standard}
                                        onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                                        className="w-full bg-surface-ground dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-zinc-100 italic placeholder:opacity-30 placeholder:normal-case uppercase"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 italic">Division / Section Designation</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. ALPHA, SECTION-1"
                                        value={formData.division}
                                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                                        className="w-full bg-surface-ground dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-zinc-100 italic placeholder:opacity-30 placeholder:normal-case uppercase"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 italic">Leadership Deployment</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.class_teacher_id}
                                            onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                                            className="w-full appearance-none bg-surface-ground dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-700 dark:text-zinc-300 cursor-pointer italic uppercase tracking-wider"
                                        >
                                            <option value="">Select head instructor (optional)</option>
                                            {staff.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 pointer-events-none group-focus-within:text-primary-main transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 rounded-radius-medium bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark shadow-2xl shadow-primary-main/20 active:scale-95 transition-all flex items-center justify-center gap-3 italic ring-4 ring-primary-main/5"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {editingClass ? 'Update Central Record' : 'Establish Unit'}
                                            <BadgeCheck className="w-4.5 h-4.5" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="w-full py-5 rounded-radius-medium bg-surface-ground dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-900 dark:hover:text-white transition-all italic active:scale-95"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pagination Footer */}
            {!loading && total > 0 && (
                <div className="bg-surface-paper dark:bg-zinc-900/50 p-6 rounded-radius-large border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 p-1.5 bg-surface-ground dark:bg-zinc-800/50 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 shadow-inner">
                            {[5, 10, 20].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        setPageSize(size);
                                        setPage(1);
                                    }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all tracking-wider italic",
                                        pageSize === size
                                            ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.3em] italic">Units/View</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {(() => {
                            const totalPages = Math.ceil(total / pageSize);
                            let startPage = Math.max(1, page - 2);
                            const endPage = Math.min(totalPages, startPage + 4);
                            if (endPage - startPage < 4) {
                                startPage = Math.max(1, endPage - 4);
                            }

                            return (
                                <>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2.5 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 disabled:opacity-20 hover:bg-surface-ground dark:hover:bg-zinc-800 transition-all text-zinc-400 shadow-sm active:scale-90"
                                    >
                                        <ChevronDown className="w-5 h-5 rotate-90" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={cn(
                                                    "w-10 h-10 rounded-radius-medium text-[10px] font-black transition-all italic tracking-widest",
                                                    page === p
                                                        ? "bg-primary-main text-white shadow-xl shadow-primary-main/20 scale-110"
                                                        : "hover:bg-surface-ground dark:hover:bg-zinc-800 text-zinc-400"
                                                )}
                                            >
                                                {p.toString().padStart(2, '0')}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2.5 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 disabled:opacity-20 hover:bg-surface-ground dark:hover:bg-zinc-800 transition-all text-zinc-400 shadow-sm active:scale-90"
                                    >
                                        <ChevronDown className="w-5 h-5 -rotate-90" />
                                    </button>
                                </>
                            );
                        })()}
                    </div>

                    <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.3em] italic">
                        Record Sequence: {Math.min(page * pageSize, total).toString().padStart(total.toString().length, '0')} of {total} Units
                    </div>
                </div>
            )}

            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Decommission Academic Unit"
                description="Institutional Security Protocol: Are you certain you wish to purge this unit from the registry? This action will permanently decommission the record and affect associated student assignments."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Execute Decommission"
                variant="danger"
            />
        </div>
    );
}
