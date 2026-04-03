'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    CreditCard,
    Plus,
    Loader2,
    X,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronDown,
    ShieldCheck,
    IndianRupee,
    GraduationCap,
    Lock
} from 'lucide-react';
import { ConfirmBox } from '@/components/ConfirmBox';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface FeeStructure {
    id: number;
    class_id: number;
    year: number;
    fee_amount: number;
    school_class?: SchoolClass;
}

export default function FeeStructurePage() {
    const { user } = useAuth();
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        class_id: '',
        year: new Date().getFullYear().toString(),
        fee_amount: ''
    });

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const fetchStructures = useCallback(async () => {
        setLoading(true);
        try {
            const [structureData, classData] = await Promise.all([
                api.getFeeStructures(),
                api.getClasses()
            ]);
            setStructures(structureData);
            setClasses(classData.items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchStructures();
    }, [user, fetchStructures]);

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
                await api.updateFeeStructure(selectedId, data);
            } else {
                await api.addFeeStructure(data);
            }
            setShowModal(false);
            fetchStructures();
            setFormData({ class_id: '', year: new Date().getFullYear().toString(), fee_amount: '' });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save fee structure');
        }
    };

    const handleEdit = (fee: FeeStructure) => {
        setFormData({
            class_id: fee.class_id.toString(),
            year: fee.year.toString(),
            fee_amount: fee.fee_amount.toString()
        });
        setSelectedId(fee.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        try {
            await api.deleteFeeStructure(idToDelete);
            fetchStructures();
            setIsConfirmOpen(false);
            setIdToDelete(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to purge registry entry');
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header section */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/20 ring-4 ring-blue-600/5 transition-transform hover:scale-105 duration-300">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Institutional Fee Registry
                        </h1>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic flex items-center gap-2">
                            Standardized Financial Obligations <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ class_id: '', year: new Date().getFullYear().toString(), fee_amount: '' });
                            setShowModal(true);
                        }}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3 overflow-hidden group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Onboard Registry Entry
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-center gap-4 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold italic">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 -mr-32 -mt-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-zinc-500 relative z-10">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin opacity-20" />
                            <Lock className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="font-bold text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Registry...</p>
                    </div>
                ) : structures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-zinc-500 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-inner">
                            <CreditCard className="w-10 h-10 opacity-20" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-white">No financial benchmarks established.</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Initialize the registry to define periodic fees.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-zinc-950/50">
                                    <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800">Academic Grade</th>
                                    <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800">Operational Era</th>
                                    <th className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800">Financial Obligation</th>
                                    <th className="px-10 py-6 border-b border-zinc-100 dark:border-zinc-800 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Registry Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {structures.map((fee) => (
                                    <tr key={fee.id} className="group/row hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600/5 flex items-center justify-center border border-blue-600/10 group-hover/row:bg-blue-600 transition-colors shadow-sm">
                                                    <GraduationCap className="w-5 h-5 text-blue-600 group-hover/row:text-white transition-colors" />
                                                </div>
                                                <span className="font-bold text-zinc-900 dark:text-white group-hover/row:italic transition-all">
                                                    {fee.school_class ? `Grade ${fee.school_class.standard} • Division ${fee.school_class.division}` : 'Unidentified Category'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                FY {fee.year}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4 text-blue-600 opacity-40 group-hover/row:opacity-100 transition-opacity" />
                                                <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight italic">
                                                    {fee.fee_amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    onClick={() => handleEdit(fee)}
                                                    className="p-3 text-zinc-400 hover:text-blue-600 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700"
                                                    title="Modify Benchmark"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIdToDelete(fee.id);
                                                        setIsConfirmOpen(true);
                                                    }}
                                                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700"
                                                    title="Purge Entry"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Registry Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-zinc-900/40 animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full blur-3xl" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold tracking-tight italic">
                                        {isEditing ? 'Modify Benchmark' : 'Initialize Obligation'}
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Institutional Registry Control</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/20 rounded-xl transition-all group">
                                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Academic Category</label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white italic"
                                    >
                                        <option value="">Select Grade Classification...</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.standard} - {c.division}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Fiscal Year</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            required
                                            min="2000"
                                            max="2100"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Standardized Value</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 font-bold opacity-40 group-focus-within:opacity-100 transition-opacity">
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.fee_amount}
                                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white italic tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-6 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all overflow-hidden relative group"
                            >
                                <span className="relative z-10 transition-transform group-hover:scale-110 block">
                                    {isEditing ? 'Authenticate Benchmark' : 'Authorize Obligation'}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmBox
                isOpen={isConfirmOpen}
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Purge Registry Entry"
                description="This action will permanently remove the standardized financial benchmark for this academic level. This operation is irreversible."
                confirmText="Purge Entry"
                cancelText="Retain Entry"
                variant="danger"
            />
        </div>
    );
}
