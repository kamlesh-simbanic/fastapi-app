'use client';

import React, { useState, useEffect } from 'react';
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
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info,
    ChevronDown,
    Wallet,
    Fingerprint,
    History,
    IndianRupee
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

    // Fetch suggested fee
    useEffect(() => {
        const fetchSuggestedFee = async () => {
            if (selectedStudent && formData.year) {
                try {
                    const data = await api.getSuggestedFee(selectedStudent.gr_no, formData.year);
                    if (data && data.fee_amount) {
                        setFormData(prev => ({ ...prev, amount: data.fee_amount.toString() }));
                    }
                } catch {
                    console.log('No fee structure found for this student/year');
                }
            }
        };
        fetchSuggestedFee();
    }, [selectedStudent, formData.year]);

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
            <section className="space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-400 hover:text-blue-600 transition-all uppercase tracking-[0.2em] group"
                >
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Back to Fee Ledger
                </button>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/20 ring-4 ring-blue-600/5">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                            Record Fee Payment
                        </h1>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic">Fee Collection</p>
                    </div>
                </div>
            </section>

            {success ? (
                <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-20 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl shadow-blue-600/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full -mr-40 -mt-40 w-80 h-80 top-0 right-0" />
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/30 relative z-10 transition-transform hover:scale-110">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Payment Recorded Successfully!</h2>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] opacity-70 italic max-w-sm mx-auto">
                            The payment has been added to the student ledger. Redirecting...
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 relative z-10">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
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

                    {/* Beneficiary Identification */}
                    <div className="p-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -mr-12 -mt-12 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />

                        <div className="flex items-center gap-4 relative z-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/10 shadow-sm">
                                <Fingerprint className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Select Student</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                                    Find Student <div className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-40 animate-pulse" />
                                </p>
                            </div>
                        </div>

                        {!selectedStudent ? (
                            <div className="space-y-4 relative z-10">
                                <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by student name or GR number..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className="w-full bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-xl py-5 pl-16 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white italic placeholder:opacity-50"
                                    />
                                    {searchingStudent && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {suggestions.length > 0 && (
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 z-20 relative">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent(s);
                                                    setSuggestions([]);
                                                    setStudentSearch('');
                                                }}
                                                className="w-full px-8 py-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-all"
                                            >
                                                <div className="flex items-center gap-5 text-left">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-600/5 flex items-center justify-center border border-blue-600/10 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors shadow-sm">
                                                        <User className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-white group-hover:italic transition-all">{s.name} {s.surname}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 group-hover:text-blue-600 transition-colors">GR NO: {s.gr_no}</p>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-5 h-5 text-zinc-300 rotate-180 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-2xl bg-blue-600/5 border border-blue-600/20 animate-in zoom-in-95 relative z-10 gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/20 ring-4 ring-blue-600/5 transition-transform hover:rotate-3">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight italic">{selectedStudent.name} {selectedStudent.surname}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-600/10 px-2.5 py-1 rounded-lg border border-blue-600/10 uppercase tracking-[0.2em] shadow-sm">Active Student</span>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic opacity-70">GR NO: {selectedStudent.gr_no}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="px-6 py-3 text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all uppercase tracking-[0.2em] border border-zinc-100 dark:border-zinc-800"
                                >
                                    Change Student
                                </button>
                            </div>
                        )}
                        {errors.student && <p className="text-[10px] font-bold text-red-600 ml-1 uppercase tracking-[0.2em] italic animate-pulse">{errors.student}</p>}
                    </div>

                    {/* Financial Parameters */}
                    <div className="p-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-12 -mt-12 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />

                        <div className="flex items-center gap-4 relative z-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 shadow-sm">
                                <CreditCard className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Payment Details</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                                    Transaction Details <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-40" />
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-[0.2em]">Amount</label>
                                <div className="relative group">
                                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={cn(
                                            "w-full bg-zinc-50/50 dark:bg-zinc-800/20 border rounded-xl py-5 pl-14 pr-6 text-lg font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white tracking-tight italic",
                                            errors.amount ? "border-red-500 focus:ring-red-600/5" : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                </div>
                                {errors.amount && <p className="text-[10px] font-bold text-red-600 ml-1 mt-1 uppercase tracking-widest italic">{errors.amount}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-[0.2em]">Payment Mode</label>
                                <div className="relative group">
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-xl py-5 px-6 text-[10px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all appearance-none cursor-pointer uppercase tracking-[0.2em] shadow-sm italic"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online / UPI</option>
                                        <option value="check">Cheque</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-[0.2em]">Term</label>
                                <div className="relative group">
                                    <History className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <select
                                        name="term"
                                        value={formData.term}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-xl py-5 pl-14 pr-10 text-[10px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all appearance-none cursor-pointer uppercase tracking-[0.2em] shadow-sm italic"
                                    >
                                        <option value="summer">Term 1</option>
                                        <option value="winter">Term 2</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-[0.2em]">Academic Year</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-xl py-5 pl-14 pr-10 text-[10px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all appearance-none cursor-pointer uppercase tracking-[0.2em] shadow-sm italic"
                                    >
                                        {[...Array(5)].map((_, i) => {
                                            const y = new Date().getFullYear() - i;
                                            return <option key={y} value={y}>Academic Year {y}</option>;
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10 pt-4">
                            <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-[0.2em]">Payment Remarks</label>
                            <div className="relative group">
                                <Info className="absolute left-6 top-6 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <textarea
                                    name="payment_details"
                                    value={formData.payment_details}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Enter payment reference number or bank details..."
                                    className="w-full bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-6 pl-16 pr-8 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white resize-none font-medium italic placeholder:opacity-40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-10 pt-12">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-[0.3em] group flex items-center gap-2"
                        >
                            Cancel
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-red-500 transition-colors" />
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-16 py-6 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving Payment...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    Record Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
