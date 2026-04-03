'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';
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
    AlertCircle,
    UserCircle,
    LayoutGrid,
    List,
    CheckCircle2
} from 'lucide-react';
import { ConfirmBox } from '@/components/ConfirmBox';
import Link from 'next/link';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface ClassStudent {
    id: number;
    academic_year: string;
    class_id: number;
    students: number[];
    school_class?: SchoolClass;
}

export default function ClassStudentsPage() {
    const { user } = useAuth();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mappings, setMappings] = useState<ClassStudent[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [academicYear, setAcademicYear] = useState('2025-26');
    const [classFilter, setClassFilter] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState<ClassStudent | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        academic_year: '2025-26',
        class_id: '',
        students_raw: '' // Comma separated IDs for simplicity in this demo
    });

    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [mappingsData, classesData] = await Promise.all([
                api.getClassStudents({ academic_year: academicYear, skip: (page - 1) * pageSize, limit: pageSize }),
                api.getClasses({ limit: 100 })
            ]);

            setMappings(mappingsData.items);
            setTotal(mappingsData.total);
            setClasses(classesData.items);
        } catch (err: unknown) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load class assignments.');
        } finally {
            setLoading(false);
        }
    }, [academicYear, page, pageSize]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
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
                await api.updateClassStudent(editingMapping.id, payload);
            } else {
                await api.addClassStudent(payload);
            }

            setIsAddOpen(false);
            setEditingMapping(null);
            setFormData({ academic_year: '2025-26', class_id: '', students_raw: '' });
            fetchData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save assignment.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await api.deleteClassStudent(idToDelete);
            fetchData();
            setDeleteConfirmOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete assignment.';
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
        ? mappings.filter(m => m.class_id.toString() === classFilter)
        : mappings;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white flex items-center gap-4 italic tracking-tight">
                        <div className="w-14 h-14 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        Academic Cohorts
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic opacity-70 uppercase tracking-[0.2em] text-[10px]">Allocate student groups to specific classes for the active academic cycle.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingMapping(null);
                        setFormData({ academic_year: academicYear, class_id: '', students_raw: '' });
                        setIsAddOpen(true);
                    }}
                    className="px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark shadow-2xl shadow-primary-main/20 active:scale-95 transition-all flex items-center gap-3 italic ring-4 ring-primary-main/5"
                >
                    <Plus className="w-4 h-4" />
                    Allocate Cohort
                </button>
            </section>

            {/* Toolbar */}
            <section className="flex flex-col sm:flex-row items-center gap-6 bg-surface-paper dark:bg-zinc-900 p-6 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                <div className="flex items-center gap-6 flex-1 w-full relative z-10">
                    <div className="w-12 h-12 rounded-radius-medium bg-primary-main/10 flex items-center justify-center border border-primary-main/20 shadow-inner">
                        <Filter className="w-6 h-6 text-primary-main" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="relative group">
                            <select
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-3.5 pl-5 pr-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 transition-all cursor-pointer text-zinc-900 dark:text-white italic"
                            >
                                <option value="2024-25">Cycle: 2024-25</option>
                                <option value="2025-26">Cycle: 2025-26</option>
                                <option value="2026-27">Cycle: 2026-27</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 pointer-events-none group-focus-within:text-primary-main transition-colors" />
                        </div>

                        <div className="relative group">
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-3.5 pl-5 pr-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 transition-all cursor-pointer text-zinc-900 dark:text-white italic"
                            >
                                <option value="">All Academic Units</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.standard.toUpperCase()} - {c.division.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 pointer-events-none group-focus-within:text-primary-main transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-surface-ground dark:bg-zinc-800 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 relative z-10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2.5 rounded-radius-medium transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-5 rounded-radius-medium bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-4 text-error animate-in shake duration-300 italic shadow-sm">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-black uppercase tracking-widest leading-tight">{error}</p>
                </div>
            )}

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in">
                        <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                        <div className="text-center">
                            <p className="font-bold text-[10px] tracking-[0.4em] uppercase opacity-70 italic">Booting Synchronizers...</p>
                            <p className="text-[9px] font-bold text-zinc-400 animate-pulse italic mt-1 uppercase tracking-widest">Accessing Institutional Registry</p>
                        </div>
                    </div>
                ) : filteredMappings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in scale-in-95">
                        <div className="w-24 h-24 rounded-radius-large bg-surface-paper dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-inner">
                            <Users className="w-12 h-12 text-zinc-200 dark:text-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight uppercase">Registry Status: Vacant</h3>
                            <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed italic opacity-70 uppercase tracking-widest text-[10px] mx-auto">No student cohorts have been grouped into classes for the selected cycle yet.</p>
                        </div>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark transition-all shadow-2xl shadow-primary-main/20 active:scale-95 italic"
                        >
                            Initialize Allocation Flow
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-8 duration-700">
                        {filteredMappings.map((m) => (
                            <div key={m.id} className="group p-10 rounded-radius-large bg-surface-paper dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-main/40 transition-all hover:shadow-2xl hover:shadow-primary-main/5 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-40 h-40 bg-primary-main/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                </div>

                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="space-y-3">
                                        <div className="px-4 py-1.5 bg-primary-main/5 text-primary-main border border-primary-main/10 rounded-radius-medium text-[9px] font-black uppercase tracking-[0.3em] inline-block italic">
                                            Cycle {m.academic_year}
                                        </div>
                                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic uppercase group-hover:text-primary-main transition-colors">
                                            {m.school_class ? `${m.school_class.standard} - ${m.school_class.division}` : `ID: ${m.class_id}`}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => openEdit(m)} className="p-3 text-zinc-400 hover:text-primary-main bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90" title="Revise Configuration"><Edit2 className="w-5 h-5" /></button>
                                        <button onClick={() => triggerDelete(m.id)} className="p-3 text-zinc-400 hover:text-error bg-white dark:bg-zinc-800 rounded-radius-medium transition-all shadow-sm active:scale-90" title="Rescind Deployment"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>

                                <div className="bg-surface-ground dark:bg-zinc-800/80 rounded-radius-large p-7 mb-10 relative z-10 border border-zinc-50 dark:border-zinc-800 shadow-inner group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Cohort Strength</span>
                                        <span className="text-2xl font-black text-primary-main italic">{m.students.length.toString().padStart(2, '0')}</span>
                                    </div>
                                    <div className="flex -space-x-3.5 overflow-hidden">
                                        {[...Array(Math.min(6, m.students.length))].map((_, i) => (
                                            <div key={i} className="inline-block h-12 w-12 rounded-full ring-4 ring-white dark:ring-zinc-900 bg-surface-paper dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 shadow-sm group-hover:scale-110 transition-transform duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                                <UserCircle className="w-7 h-7 text-zinc-200 dark:text-zinc-700 group-hover:text-primary-main/40 transition-colors" />
                                            </div>
                                        ))}
                                        {m.students.length > 6 && (
                                            <div className="flex items-center justify-center h-12 w-12 rounded-full ring-4 ring-white dark:ring-zinc-900 bg-primary-main text-[10px] font-black text-white shadow-xl shadow-primary-main/30 italic z-10 transform hover:scale-110 transition-transform">
                                                +{m.students.length - 6}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3 text-zinc-300 dark:text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] italic">
                                        <Calendar className="w-4 h-4 text-primary-main opacity-40 group-hover:opacity-100 transition-opacity" />
                                        Deployment Active
                                    </div>
                                    <Link
                                        href={`/class-students/detail?id=${m.id}`}
                                        className="px-6 py-3 bg-primary-main/5 text-primary-main rounded-radius-medium text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-main hover:text-white transition-all transform active:scale-95 italic shadow-sm"
                                    >
                                        Inspect Roster
                                    </Link>
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
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Academic Session</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Unit Identifier</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 italic">Enrolled Force</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 text-right italic">Registry Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {filteredMappings.map((m) => (
                                        <tr key={m.id} className="group hover:bg-zinc-50/[0.3] dark:hover:bg-zinc-800/30 transition-all border-b border-zinc-50 dark:border-zinc-800 last:border-0 text-zinc-900 dark:text-zinc-100">
                                            <td className="px-10 py-7 text-sm font-black italic opacity-60 uppercase tracking-widest text-zinc-500">
                                                {m.academic_year}
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-radius-medium bg-primary-main/5 flex items-center justify-center text-primary-main font-black text-base italic border border-primary-main/10 shadow-inner group-hover:bg-primary-main group-hover:text-white transition-all transform group-hover:scale-105 duration-300">
                                                        {m.school_class?.division.toUpperCase()}
                                                    </div>
                                                    <span className="text-lg font-black tracking-tight italic uppercase group-hover:text-primary-main transition-colors">
                                                        {m.school_class ? `${m.school_class.standard} - ${m.school_class.division}` : `Unit ID: ${m.class_id}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="inline-flex items-center px-5 py-2 bg-surface-ground dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-radius-medium text-[10px] font-black tracking-[0.2em] uppercase border border-zinc-100 dark:border-zinc-700 italic group-hover:text-primary-main group-hover:border-primary-main/20 group-hover:bg-primary-main/5 transition-all">
                                                    {m.students.length.toString().padStart(2, '0')} Members
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <Link
                                                        href={`/class-students/detail?id=${m.id}`}
                                                        className="p-3.5 bg-white dark:bg-zinc-800 text-primary-main hover:bg-primary-main hover:text-white rounded-radius-medium transition-all shadow-sm active:scale-90 border border-zinc-100 dark:border-zinc-700"
                                                        title="Inspect Registry"
                                                    >
                                                        <UserCircle className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(m)}
                                                        className="p-3.5 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-primary-main rounded-radius-medium transition-all shadow-sm active:scale-90 border border-zinc-100 dark:border-zinc-700"
                                                        title="Revise Configuration"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerDelete(m.id)}
                                                        className="p-3.5 bg-white dark:bg-zinc-800 text-zinc-200 hover:text-error rounded-radius-medium transition-all shadow-sm active:scale-90 border border-zinc-100 dark:border-zinc-700"
                                                        title="Rescind Deployment"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
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

            {/* Allocation Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-paper dark:bg-zinc-900 w-full max-w-lg rounded-radius-large border border-primary-main/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-main/5 rounded-full -mr-24 -mt-24 blur-3xl" />

                        <div className="p-12 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-surface-ground/50 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/30 ring-4 ring-primary-main/5">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic leading-none">
                                        {editingMapping ? 'Update Registry' : 'Establish Cohort'}
                                    </h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Academic Unit Deployment</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-300 transition-all active:scale-90"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-12 space-y-10 relative z-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] ml-1 italic">Academic Cycle</label>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. 2025-26"
                                            value={formData.academic_year}
                                            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                            className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-white italic tracking-widest placeholder:opacity-20 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] ml-1 italic">Assigned Unit</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-700 dark:text-zinc-300 cursor-pointer italic uppercase tracking-widest"
                                        >
                                            <option value="">Select unit...</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.standard.toUpperCase()} - {c.division.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-300 pointer-events-none group-focus-within:text-primary-main" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] ml-1 italic">Student Enrollment Registry (Comma Separated)</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="e.g. 1024, 1025, 1030..."
                                    value={formData.students_raw}
                                    onChange={(e) => setFormData({ ...formData, students_raw: e.target.value })}
                                    className="w-full bg-surface-ground dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-radius-medium py-5 px-7 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black resize-none text-zinc-900 dark:text-white leading-loose italic placeholder:opacity-20"
                                />
                                <div className="flex items-center gap-2 mt-1 italic opacity-40">
                                    <AlertCircle className="w-3 h-3 text-primary-main" />
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Input core enrollment IDs stored in institutional database.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 rounded-radius-medium bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-primary-dark shadow-2xl shadow-primary-main/30 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 italic ring-4 ring-primary-main/5"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            {editingMapping ? 'Sync Configuration' : 'Establish Deployment'}
                                            <CheckCircle2 className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="w-full py-5 rounded-radius-medium bg-surface-ground dark:bg-zinc-950 text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-900 dark:hover:text-white transition-all italic active:scale-95"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && total > 0 && (
                <div className="bg-surface-paper dark:bg-zinc-900 p-8 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-main/10" />

                    <div className="flex items-center gap-6 order-2 md:order-1">
                        <div className="flex items-center gap-2 p-2 bg-surface-ground dark:bg-zinc-800 rounded-radius-medium border border-zinc-100 dark:border-zinc-700 shadow-inner">
                            {[5, 10, 20, 50].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        setPageSize(size);
                                        setPage(1);
                                    }}
                                    className={cn(
                                        "px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic",
                                        pageSize === size
                                            ? "bg-white dark:bg-zinc-700 shadow-xl text-primary-main scale-105"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-500"
                                    )}
                                >
                                    {size.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.3em] italic">Display Limit</span>
                    </div>

                    <div className="flex items-center gap-4 order-1 md:order-2">
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
                                        className="w-12 h-12 flex items-center justify-center rounded-radius-medium border border-zinc-100 dark:border-zinc-800 disabled:opacity-20 hover:bg-primary-main/10 hover:border-primary-main/20 transition-all text-zinc-400 active:scale-90 shadow-sm"
                                    >
                                        <ChevronDown className="w-5 h-5 rotate-90" />
                                    </button>
                                    <div className="flex items-center gap-2.5">
                                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={cn(
                                                    "w-12 h-12 rounded-radius-medium text-[10px] font-black transition-all transform active:scale-90 italic tracking-[0.2em]",
                                                    page === p
                                                        ? "bg-primary-main text-white shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/10 scale-110"
                                                        : "hover:bg-surface-ground dark:hover:bg-zinc-800 text-zinc-400 border border-transparent"
                                                )}
                                            >
                                                {p.toString().padStart(2, '0')}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-radius-medium border border-zinc-100 dark:border-zinc-800 disabled:opacity-20 hover:bg-primary-main/10 hover:border-primary-main/20 transition-all text-zinc-400 active:scale-90 shadow-sm"
                                    >
                                        <ChevronDown className="w-5 h-5 -rotate-90" />
                                    </button>
                                </>
                            );
                        })()}
                    </div>

                    <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.4em] order-3 bg-surface-ground dark:bg-zinc-800/50 px-6 py-3 rounded-radius-medium border border-zinc-50 dark:border-zinc-800 italic">
                        Sequence {((page - 1) * pageSize + 1).toString().padStart(total.toString().length, '0')} &ndash; {Math.min(page * pageSize, total).toString().padStart(total.toString().length, '0')} <span className="mx-2 opacity-30">/</span> {total} Units
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmBox
                isOpen={deleteConfirmOpen}
                loading={isDeleting}
                title="Dissolve Cohort Content"
                description={`Verification Protocol: Are you absolutely certain you wish to dissolve this student allocation? This operation will permanently rescind all student segments for the ${academicYear} cycle from the institutional record.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Execute Dissolution"
                variant="danger"
            />
        </div>
    );
}
