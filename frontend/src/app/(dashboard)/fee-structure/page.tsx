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
    ChevronDown
} from 'lucide-react';

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

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this fee structure?')) return;
        try {
            await api.deleteFeeStructure(id);
            fetchStructures();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

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

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-xs uppercase tracking-widest">Loading structures...</p>
                    </div>
                ) : structures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
                        <CreditCard className="w-16 h-16 opacity-20" />
                        <p className="font-bold">No fee structures defined yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-950/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Class</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Academic Year</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Fee Amount</th>
                                    <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {structures.map((fee) => (
                                    <tr key={fee.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-zinc-900 dark:text-white capitalize">
                                            {fee.school_class ? `${fee.school_class.standard} - ${fee.school_class.division}` : 'Unknown Class'}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                                            {fee.year}
                                        </td>
                                        <td className="px-8 py-5 font-black text-emerald-600 dark:text-emerald-400 text-lg">
                                            ${fee.fee_amount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(fee)} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(fee.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{isEditing ? 'Edit Fee' : 'New Fee Structure'}</h2>
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
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-10 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
