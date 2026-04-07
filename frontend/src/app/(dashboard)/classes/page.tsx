'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { addClass, updateClass, deleteClass } from './actions';
import { getStaff } from '../staff/actions';
import { useAuth } from '@/components/AuthContext';
import {
    Layers,
    Plus,
    Search,
    Loader2,
    X,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import Table from '@/components/Table';
import { ConfirmBox } from '@/components/ConfirmBox';
import { SchoolClass } from './types';
import { Staff } from '../staff/types';
import { getClassColumns } from './utils';

export default function ClassesPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Classes State
    const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [classFormData, setClassFormData] = useState({
        standard: '',
        division: '',
        class_teacher_id: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { getClasses } = await import('./actions');
            const [classesData, staffData] = await Promise.all([
                getClasses({ limit: 100 }),
                getStaff({ limit: 200 })
            ]);
            setAllClasses(classesData.items);
            setStaff(staffData.items);
        } catch (err: unknown) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load classes or staff.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchData();
    }, [fetchData, user]);

    const openEdit = (cls: SchoolClass) => {
        setEditingClass(cls);
        setClassFormData({
            standard: cls.standard,
            division: cls.division,
            class_teacher_id: cls.class_teacher_id?.toString() || ''
        });
        setIsAddOpen(true);
    };

    const handleClassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                standard: classFormData.standard,
                division: classFormData.division,
                class_teacher_id: classFormData.class_teacher_id ? parseInt(classFormData.class_teacher_id) : null
            };

            if (editingClass) {
                await updateClass(editingClass.id, payload);
            } else {
                await addClass(payload);
            }

            setIsAddOpen(false);
            setEditingClass(null);
            setClassFormData({ standard: '', division: '', class_teacher_id: '' });
            fetchData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save class.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            await deleteClass(deleteConfirmId);
            fetchData();
            setDeleteConfirmId(null);
        } catch {
            setError('Delete operation failed.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredClasses = useMemo(() => {
        return allClasses.filter(cls =>
            cls.standard.toLowerCase().includes(search.toLowerCase()) ||
            cls.division.toLowerCase().includes(search.toLowerCase())
        );
    }, [allClasses, search]);

    const paginatedClasses = filteredClasses.slice((page - 1) * pageSize, page * pageSize);

    if (!user) return null;

    return (
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
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage standards, divisions, and class teacher assignments.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingClass(null);
                        setClassFormData({ standard: '', division: '', class_teacher_id: '' });
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
                        placeholder="Filter by standard or division..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold tracking-tight uppercase">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-xs uppercase tracking-widest opacity-70 italic">Fetching standards...</p>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <Layers className="w-16 h-16 text-zinc-300 opacity-20" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No classes found</h3>
                        <button onClick={() => setSearch('')} className="text-indigo-500 text-sm font-bold hover:underline">Clear search</button>
                    </div>
                ) : (
                    <Table
                        columns={getClassColumns({
                            onEdit: openEdit,
                            onDelete: (id) => setDeleteConfirmId(id),
                            onViewStudents: (cls) => router.push(`/class-students/detail?id=${cls.id}`)
                        })}
                        data={paginatedClasses}
                        loading={loading}
                        totalCount={filteredClasses.length}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        emptyMessage="No classes found matching your search."
                    />
                )}
            </div>

            {/* Class Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tight">{editingClass ? 'Edit Class' : 'Create New Class'}</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleClassSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Standard</label>
                                    <input required type="text" placeholder="e.g. 1st" value={classFormData.standard} onChange={(e) => setClassFormData({ ...classFormData, standard: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Division</label>
                                    <input required type="text" placeholder="e.g. A" value={classFormData.division} onChange={(e) => setClassFormData({ ...classFormData, division: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Class Teacher</label>
                                <div className="relative group">
                                    <select value={classFormData.class_teacher_id} onChange={(e) => setClassFormData({ ...classFormData, class_teacher_id: e.target.value })} className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-5 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                        <option value="">Select a teacher...</option>
                                        {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.qualification})</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingClass ? 'Update Class' : 'Create Class')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmBox
                isOpen={!!deleteConfirmId}
                loading={isDeleting}
                title="Delete Class"
                description="Are you sure? This will delete the class and all its properties."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmId(null)}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
