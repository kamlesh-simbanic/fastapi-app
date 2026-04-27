'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
            const [classesData, staffData] = await Promise.all([
                api.getClasses({ limit: 100 }),
                api.getStaff({ limit: 200 })
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
                await api.updateClass(editingClass.id, payload);
            } else {
                await api.addClass(payload);
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
            await api.deleteClass(deleteConfirmId);
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        Class Management
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage standards, divisions, and class teacher assignments.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingClass(null);
                        setClassFormData({ standard: '', division: '', class_teacher_id: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Class
                </button>
            </section>

            {/* Filters */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by standard or division..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-xl text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold tracking-tight uppercase">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-destructive/20 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="font-bold text-xs uppercase tracking-widest opacity-70 italic">Fetching standards...</p>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted/50 rounded-[3rem] border border-dashed border-border text-center">
                        <Layers className="w-16 h-16 text-zinc-300 opacity-20" />
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">No classes found</h3>
                        <button onClick={() => setSearch('')} className="text-primary text-sm font-bold hover:underline">Clear search</button>
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
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 dark:border-border flex items-center justify-between">
                            <h2 className="text-xl font-black text-foreground italic tracking-tight">{editingClass ? 'Edit Class' : 'Create New Class'}</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-secondary dark:hover:bg-zinc-900 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleClassSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Standard</label>
                                    <input required type="text" placeholder="e.g. 1st" value={classFormData.standard} onChange={(e) => setClassFormData({ ...classFormData, standard: e.target.value })} className="w-full bg-muted/50 border border-border rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Division</label>
                                    <input required type="text" placeholder="e.g. A" value={classFormData.division} onChange={(e) => setClassFormData({ ...classFormData, division: e.target.value })} className="w-full bg-muted/50 border border-border rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Class Teacher</label>
                                <div className="relative group">
                                    <select value={classFormData.class_teacher_id} onChange={(e) => setClassFormData({ ...classFormData, class_teacher_id: e.target.value })} className="w-full appearance-none bg-muted/50 border border-border rounded-2xl py-3.5 px-5 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-foreground cursor-pointer">
                                        <option value="">Select a teacher...</option>
                                        {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.qualification})</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
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
