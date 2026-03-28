'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    CreditCard,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    Search,
    UserCircle,
    BadgeCheck,
    DollarSign,
    Hash,
    Plus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Student {
    id: number;
    gr_no: string;
    name: string;
    surname: string;
}

interface FormState {
    student_id: string;
    gr_no: string;
    term: 'summer' | 'winter';
    year: string;
    amount: string;
    payment_method: 'cash' | 'upi' | 'cheque';
    payment_details: string;
}

const INITIAL_STATE: FormState = {
    student_id: '',
    gr_no: '',
    term: 'summer',
    year: new Date().getFullYear().toString(),
    amount: '',
    payment_method: 'cash',
    payment_details: '',
};

export default function AddFeePaymentPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Student Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const data = await api.getStudents({ search: query, limit: 5 });
            setSearchResults(data.items);
        } catch (err: unknown) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    const selectStudent = (student: Student) => {
        setSelectedStudent(student);
        setForm(prev => ({ ...prev, student_id: student.id.toString(), gr_no: student.gr_no }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.student_id) newErrors.student_id = "Please select a student.";
        if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
            newErrors.amount = "Valid amount is required.";
        }
        if (!form.term) newErrors.term = "Term is required.";
        if (!form.year) newErrors.year = "Year is required.";

        if (form.payment_method !== 'cash' && !form.payment_details.trim()) {
            newErrors.payment_details = "Payment reference/ID is required for non-cash payments.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setError(null);

        try {
            const submissionData = {
                ...form,
                student_id: parseInt(form.student_id),
                year: parseInt(form.year),
                amount: parseFloat(form.amount)
            };
            await api.addPayment(submissionData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/fees');
            }, 1500);
        } catch (err: unknown) {
            console.error('Payment failed:', err);
            const msg = err instanceof Error ? err.message : 'Failed to record payment.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <Link href="/fees" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 text-sm font-bold transition-all mb-4 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Ledger
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            Post Fee Payment
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Record a financial transaction into the student file.</p>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 self-start md:self-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Ledger Online</span>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className={cn(
                    "relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-sm",
                    success ? "border-emerald-500 shadow-2xl shadow-emerald-500/10" : "border-zinc-200 dark:border-zinc-800"
                )}>
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Transaction Verified</h3>
                                <p className="text-zinc-500 text-sm font-bold">The fee record has been cataloged. Redirecting...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-12 space-y-10">
                            {/* Student Selection Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <UserCircle className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Student Selection</h2>
                                </div>

                                {selectedStudent ? (
                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <UserCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-zinc-900 dark:text-white">{selectedStudent.name} {selectedStudent.surname}</h4>
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">GR NO: {selectedStudent.gr_no}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedStudent(null); setForm(prev => ({ ...prev, student_id: '', gr_no: '' })); }}
                                            className="p-2.5 rounded-xl hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/30"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search for student by name or GR..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl pl-14 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.student_id ? "border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/10 focus:border-emerald-500"
                                            )}
                                        />

                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-top-2">
                                                {searchResults.map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => selectStudent(s)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-900"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{s.name} {s.surname}</p>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GR: {s.gr_no}</p>
                                                        </div>
                                                        <Plus className="w-4 h-4 text-emerald-500" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />}
                                    </div>
                                )}
                                {errors.student_id && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.student_id}</p>}
                            </div>

                            {/* Payment Logic Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Transaction Details</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Academic Term</label>
                                        <select
                                            name="term"
                                            value={form.term}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white cursor-pointer"
                                        >
                                            <option value="summer">SUMMER TERM</option>
                                            <option value="winter">WINTER TERM</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Academic Year</label>
                                        <input
                                            type="number"
                                            name="year"
                                            value={form.year}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Amount ($)</label>
                                        <input
                                            name="amount"
                                            value={form.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-black focus:outline-none focus:ring-4 transition-all text-emerald-600 dark:text-emerald-400",
                                                errors.amount ? "border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/10 focus:border-emerald-500"
                                            )}
                                        />
                                        {errors.amount && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.amount}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <BadgeCheck className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Verification Mode</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Payment Method</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['cash', 'upi', 'cheque'].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, payment_method: m as 'cash' | 'upi' | 'cheque' }))}
                                                    className={cn(
                                                        "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        form.payment_method === m
                                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                                    )}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Reference/Transaction ID</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                name="payment_details"
                                                value={form.payment_details}
                                                onChange={handleChange}
                                                disabled={form.payment_method === 'cash'}
                                                placeholder={form.payment_method === 'cash' ? 'N/A' : 'e.g. UPI-123456...'}
                                                className={cn(
                                                    "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-mono",
                                                    errors.payment_details ? "border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/10 focus:border-emerald-500",
                                                    form.payment_method === 'cash' && "opacity-50 grayscale cursor-not-allowed"
                                                )}
                                            />
                                        </div>
                                        {errors.payment_details && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.payment_details}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback & Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
                                {error && (
                                    <div className="flex items-center gap-3 text-red-500 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-xs font-black uppercase tracking-wide leading-tight">{error}</p>
                                    </div>
                                )}
                                <div className="hidden md:block" />

                                <div className="flex items-center gap-4">
                                    <Link href="/fees" className="px-8 py-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-black uppercase tracking-widest transition-all">
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-12 py-4 bg-emerald-500 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                Post Receipt
                                                <Check className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-4 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50">
                    <BadgeCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Immutable Records</h4>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                            Every posted receipt generates an internal ledger entry linked to your profile.
                            Ensure transaction IDs match the bank reference for UPI and Cheque payments.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

