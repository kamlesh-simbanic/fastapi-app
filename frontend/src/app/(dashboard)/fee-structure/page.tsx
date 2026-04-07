'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getClasses } from '../classes/actions';
import { getFeeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure } from './actions';
import { FeeStructure } from './types';
import { SchoolClass } from '../classes/types';
import { getFeeStructureColumns } from './utils';
import { useAuth } from '@/components/AuthContext';
import {
    CreditCard,
    Plus,
    Loader2,
    X,
    AlertCircle,
    ChevronDown,
    Search
} from 'lucide-react';
import Table from '@/components/Table';

export default function FeeStructurePage() {
    const { user } = useAuth();
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    const [formData, setFormData] = useState({
        class_id: '',
        year: new Date().getFullYear().toString(),
        fee_amount: ''
    });

    const fetchClasses = useCallback(async () => {
        try {
            const classData = await getClasses();
            setClasses(classData.items);
        } catch {
            console.error('Failed to fetch classes');
        }
    }, []);

    const fetchStructures = useCallback(async () => {
        setLoading(true);
        try {
            const structureData = await getFeeStructures();
            setStructures(structureData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) { fetchStructures(); fetchClasses(); }
    }, [user, fetchStructures, fetchClasses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const data = {
                class_id: parseInt(formData.class_id),
                year: parseInt(formData.year),
                fee_amount: parseFloat(formData.fee_amount)
            };

            if (isEditing && selectedId) {
                await updateFeeStructure(selectedId, data);
            } else {
                await addFeeStructure(data);
            }
            setShowModal(false);
            fetchStructures();
            setFormData({ class_id: '', year: new Date().getFullYear().toString(), fee_amount: '' });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save fee structure');
        }
    };

    const openEdit = (fee: FeeStructure) => {
        setFormData({
            class_id: fee.class_id.toString(),
            year: fee.year.toString(),
            fee_amount: fee.fee_amount.toString()
        });
        setSelectedId(fee.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const triggerDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this fee structure?')) return;
        try {
            await deleteFeeStructure(id);
            fetchStructures();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const filteredStructures = useMemo(() => {
        return structures.filter(s => {
            const matchesSearch = s.school_class ? `${s.school_class.standard} ${s.school_class.division}`.toLowerCase().includes(search.toLowerCase()) : true;
            const matchesClass = selectedClass ? s.class_id.toString() === selectedClass : true;
            const matchesYear = selectedYear ? s.year.toString() === selectedYear : true;
            return matchesSearch && matchesClass && matchesYear;
        });
    }, [structures, search, selectedClass, selectedYear]);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        Fee Structure
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Define fees for each class and academic year.</p>
                </div>

                <button
                    onClick={() => {
                        setIsEditing(false);
                        setFormData({ class_id: '', year: new Date().getFullYear().toString(), fee_amount: '' });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    New Fee Structure
                </button>
            </section>

            {/* Filters Toolbar */}
            <section className="flex flex-col xl:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-48">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-xs font-black uppercase tracking-widest text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id.toString()}>{c.standard} - {c.division}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="relative group w-full sm:w-48">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-xs font-black uppercase tracking-widest text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Years</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y.toString()}>{y}</option>;
                            })}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-xs uppercase tracking-widest opacity-70 italic">Synchronizing ledger...</p>
                    </div>
                ) : filteredStructures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <CreditCard className="w-16 h-16 text-zinc-300 opacity-20" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No fee structures defined</h3>
                        <button onClick={() => { setSearch(''); setSelectedClass(''); setSelectedYear(''); }} className="text-indigo-500 text-sm font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <Table
                        columns={getFeeStructureColumns({
                            onEdit: openEdit,
                            onDelete: triggerDelete
                        })}
                        data={filteredStructures}
                        loading={loading}
                        emptyMessage="No fee structures defined yet."
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight">{isEditing ? 'Edit Fee' : 'New Fee Structure'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Select Class</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                        >
                                            <option value="">Choose Class...</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.standard} - {c.division}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Academic Year</label>
                                    <input
                                        type="number"
                                        required
                                        min="2000"
                                        max="2100"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fee Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.fee_amount}
                                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-10 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    {isEditing ? 'Update Structure' : 'Create Structure'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
