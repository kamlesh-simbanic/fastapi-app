'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClassStudents, addClassStudent, updateClassStudent, deleteClassStudent } from './actions';
import { getClasses } from '../classes/actions';
import { ClassStudent } from './types';
import { SchoolClass } from '../classes/types';
import { useAuth } from '@/components/AuthContext';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    Loader2,
    X,
    Filter,
    ChevronDown,
    UserCircle,
    LayoutGrid,
    List,
    AlertCircle
} from 'lucide-react';
import { ConfirmBox } from '@/components/ConfirmBox';
import Table from '@/components/Table';
import { getClassStudentColumns } from './utils';
import Link from 'next/link';

export default function ClassStudentsPage() {
    const { user } = useAuth();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mappings, setMappings] = useState<ClassStudent[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(12);
    const [error, setError] = useState<string | null>(null);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState<ClassStudent | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [academicYear, setAcademicYear] = useState('2025-26');
    const [classFilter, setClassFilter] = useState('');

    const [formData, setFormData] = useState({
        academic_year: '2025-26',
        class_id: '',
        students_raw: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [mappingData, classList] = await Promise.all([
                getClassStudents({ academic_year: academicYear, skip: (page - 1) * pageSize, limit: pageSize }),
                getClasses({ limit: 100 })
            ]);

            setMappings(mappingData.items || []);
            setTotal(mappingData.total || 0);
            setClasses(classList.items || []);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, academicYear]);

    useEffect(() => {
        if (user) fetchData();
    }, [fetchData, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const studentIds = formData.students_raw
                .split(',')
                .map(s => parseInt(s.trim()))
                .filter(n => !isNaN(n));

            const payload = {
                academic_year: formData.academic_year,
                class_id: parseInt(formData.class_id),
                students: studentIds
            };

            if (editingMapping) {
                await updateClassStudent(editingMapping.id, payload);
            } else {
                await addClassStudent(payload);
            }

            setIsAddOpen(false);
            setEditingMapping(null);
            setFormData({ academic_year: academicYear, class_id: '', students_raw: '' });
            fetchData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save assignment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await deleteClassStudent(idToDelete);
            fetchData();
            setDeleteConfirmOpen(false);
        } catch (err: unknown) {
            setError('Failed to delete mapping');
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const triggerDelete = (id: number) => {
        setIdToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const openEdit = (m: ClassStudent) => {
        setEditingMapping(m);
        setFormData({
            academic_year: m.academic_year,
            class_id: m.class_id.toString(),
            students_raw: m.students.join(', ')
        });
        setIsAddOpen(true);
    };

    if (!user) return null;

    const filteredMappings = classFilter
        ? mappings.filter((m: ClassStudent) => m.class_id.toString() === classFilter)
        : mappings;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        Class Student Assignment
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage student groups for each class and academic year.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingMapping(null);
                        setFormData({ academic_year: academicYear, class_id: '', students_raw: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Assignment
                </button>
            </section>

            {/* Filters & Toggle */}
            <section className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 flex-1 w-full">
                    <Filter className="w-5 h-5 text-indigo-500 ml-2" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <select
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                            >
                                <option value="2024-25">Academic Year: 2024-25</option>
                                <option value="2025-26">Academic Year: 2025-26</option>
                                <option value="2026-27">Academic Year: 2026-27</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.standard} - {c.division}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-500' : 'text-zinc-400 hover:text-zinc-500'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-500' : 'text-zinc-400 hover:text-zinc-500'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
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
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading assignments...</p>
                    </div>
                ) : filteredMappings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <Users className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No assignments found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">No students have been assigned to classes for this year yet.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {filteredMappings.map((m) => (
                            <div key={m.id} className="group p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                                            {m.academic_year}
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
                                            {m.school_class ? `${m.school_class.standard} - ${m.school_class.division}` : `Class ID: ${m.class_id}`}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(m)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => triggerDelete(m.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Student Count</span>
                                        <span className="text-lg font-black text-indigo-500">{m.students?.length || 0}</span>
                                    </div>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {[...Array(Math.min(5, m.students?.length || 0))].map((_, i) => (
                                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                <UserCircle className="w-5 h-5 text-zinc-400" />
                                            </div>
                                        ))}
                                        {(m.students?.length || 0) > 5 && (
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-indigo-500 text-[10px] font-bold text-white">
                                                +{(m.students?.length || 0) - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                        <Calendar className="w-3 h-3 text-indigo-500" />
                                        Active Mapping
                                    </div>
                                    <Link
                                        href={`/class-students/detail?id=${m.id}`}
                                        className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline transition-all"
                                    >
                                        View List
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={getClassStudentColumns({
                            onEdit: openEdit,
                            onDelete: triggerDelete
                        })}
                        data={filteredMappings}
                        loading={loading}
                        totalCount={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        emptyMessage="No assignments found"
                    />
                )}
            </div>

            {/* Add/Edit Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Users className="w-5 h-5" />
                                </div>
                                {editingMapping ? 'Edit Assignment' : 'New Assignment'}
                            </h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Academic Year</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 2025-26"
                                        value={formData.academic_year}
                                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Class</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                                        >
                                            <option value="">Select a class</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.standard} - {c.division}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Student IDs (Comma separated)</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="e.g. 101, 102, 103"
                                        value={formData.students_raw}
                                        onChange={(e) => setFormData({ ...formData, students_raw: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold resize-none"
                                    />
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
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMapping ? 'Update Assignment' : 'Create Assignment')}
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
                title="Remove Assignment"
                description="Are you sure you want to remove this class-student assignment? This will unmap all students from this class for the selected year."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Remove"
                variant="danger"
            />
        </div>
    );
}
