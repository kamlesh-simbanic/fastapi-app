'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    CreditCard,
    ChevronLeft,
    Save,
    Search,
    User,
    Calendar,
    DollarSign,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Hash,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentSuggestion {
    id: number;
    gr_no: string;
    name: string;
    surname: string;
}

export default function RecordPaymentPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        gr_no: '',
        student_id: 0,
        term: 'summer',
        year: new Date().getFullYear(),
        amount: '',
        payment_method: 'cash',
        payment_details: '',
    });

    // Student lookup state
    const [studentSearch, setStudentSearch] = useState('');
    const [suggestions, setSuggestions] = useState<StudentSuggestion[]>([]);
    const [searchingStudent, setSearchingStudent] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentSuggestion | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Debounced student search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (studentSearch.length >= 2) {
                setSearchingStudent(true);
                try {
                    const data = await api.getStudents({ search: studentSearch, limit: 5 });
                    setSuggestions(data.items);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setSearchingStudent(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [studentSearch]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedStudent) newErrors.student = 'Please select a student';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.term) newErrors.term = 'Term is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            await api.addPayment({
                ...formData,
                amount: parseFloat(formData.amount),
                gr_no: selectedStudent!.gr_no,
                student_id: selectedStudent!.id
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/fees');
            }, 2000);
        } catch (err: unknown) {
            console.error('Failed to record payment:', err);
            const message = err instanceof Error ? err.message : 'Failed to record payment. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-4 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Ledger
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Record Fee Payment
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Select a student and enter the payment details to generate a receipt.
                    </p>
                </div>
            </section>

            {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-12 text-center space-y-4 shadow-xl shadow-emerald-500/5">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Payment Recorded!</h2>
                        <p className="text-zinc-500 font-medium">The fee transaction has been logged. Redirecting to ledger...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {/* Student Selection */}
                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-black text-zinc-900 dark:text-white pb-6 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-tight">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-500" />
                            </div>
                            Select Student
                        </div>

                        {!selectedStudent ? (
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or GR number (min. 2 chars)..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                    />
                                    {searchingStudent && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {suggestions.length > 0 && (
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent(s);
                                                    setSuggestions([]);
                                                    setStudentSearch('');
                                                }}
                                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-emerald-500 group transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white/20">
                                                        <User className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-white group-hover:text-white">{s.name} {s.surname}</p>
                                                        <p className="text-xs text-zinc-400 group-hover:text-white/70 uppercase tracking-widest font-bold">GR: {s.gr_no}</p>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-5 h-5 text-zinc-300 rotate-180 group-hover:text-white" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/30 animate-in zoom-in-95">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{selectedStudent.name} {selectedStudent.surname}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Active Student</span>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">GR: {selectedStudent.gr_no}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="px-4 py-2 text-xs font-black text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all uppercase tracking-widest"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                        {errors.student && <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-[0.2em]">{errors.student}</p>}
                    </div>

                    {/* Payment Details */}
                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-black text-zinc-900 dark:text-white pb-6 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-tight">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-amber-500" />
                            </div>
                            Transaction Details
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-widest">Total Amount</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-4 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                            errors.amount ? "border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        )}
                                    />
                                </div>
                                {errors.amount && <p className="text-[10px] font-black text-red-500 ml-1 mt-1 uppercase tracking-widest">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-widest">Payment Method</label>
                                <div className="relative group">
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-widest">Session Term</label>
                                <div className="relative group">
                                    <select
                                        name="term"
                                        value={formData.term}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="summer">Summer Term</option>
                                        <option value="winter">Winter Term</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-widest">Academic Year</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer"
                                    >
                                        {[...Array(5)].map((_, i) => {
                                            const y = new Date().getFullYear() - i;
                                            return <option key={y} value={y}>{y}</option>;
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-widest">Additional Notes</label>
                            <div className="relative group">
                                <Info className="absolute left-5 top-5 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                <textarea
                                    name="payment_details"
                                    value={formData.payment_details}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="e.g. Transaction ID, Check Number, or special notes..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-6 pt-10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-xs font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                            Cancel & Exit
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-5 bg-emerald-500 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Receipt...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Confirm Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
