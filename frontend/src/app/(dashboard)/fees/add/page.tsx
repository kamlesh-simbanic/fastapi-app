'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
    Info,
    ChevronDown
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
        const fetchSuggestedFeeData = async () => {
            if (selectedStudent && formData.year) {
                try {
                    const data = await api.getSuggestedFee(selectedStudent.gr_no, formData.year);
                    if (data && data.fee_amount) {
                        setFormData(prev => ({ ...prev, amount: data.fee_amount.toString() }));
                    }
                } catch {
                    alert('No fee structure found for this student/year');
                }
            }
        };
        fetchSuggestedFeeData();
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
            <section className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-success transition-colors mb-4 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Ledger
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Record Fee Payment
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Select a student and enter the payment details to generate a receipt.
                    </p>
                </div>
            </section>

            {success ? (
                <div className="bg-success/10 border border-success/20 rounded-[2.5rem] p-12 text-center space-y-4 shadow-xl shadow-success/5">
                    <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-success/40">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Payment Recorded!</h2>
                        <p className="text-muted-foreground font-medium">The fee transaction has been logged. Redirecting to ledger...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                    {error && (
                        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {/* Student Selection */}
                    <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-black text-foreground pb-6 border-b border-zinc-100 dark:border-border uppercase tracking-tight">
                            <div className="w-11 h-11 rounded-2xl bg-success/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-success" />
                            </div>
                            Select Student
                        </div>

                        {!selectedStudent ? (
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or GR number (min. 2 chars)..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all text-foreground"
                                    />
                                    {searchingStudent && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-success animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {suggestions.length > 0 && (
                                    <div className="bg-card border border-border rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent(s);
                                                    setSuggestions([]);
                                                    setStudentSearch('');
                                                }}
                                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-success group transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-white/20">
                                                        <User className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground group-hover:text-white">{s.name} {s.surname}</p>
                                                        <p className="text-xs text-muted-foreground group-hover:text-white/70 uppercase tracking-widest font-bold">GR: {s.gr_no}</p>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-5 h-5 text-zinc-300 rotate-180 group-hover:text-white" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-success/5 border border-success/30 animate-in zoom-in-95">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[2rem] bg-success flex items-center justify-center shadow-lg shadow-success/30">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground tracking-tight">{selectedStudent.name} {selectedStudent.surname}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-success bg-success/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">Active Student</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">GR: {selectedStudent.gr_no}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="px-4 py-2 text-xs font-black text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all uppercase tracking-widest"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                        {errors.student && <p className="text-[10px] font-black text-destructive ml-1 uppercase tracking-[0.2em]">{errors.student}</p>}
                    </div>

                    {/* Payment Details */}
                    <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-black text-foreground pb-6 border-b border-zinc-100 dark:border-border uppercase tracking-tight">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-amber-500" />
                            </div>
                            Transaction Details
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-widest">Total Amount</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-success transition-colors" />
                                    <input
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={cn(
                                            "w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 transition-all text-foreground",
                                            errors.amount ? "border-destructive focus:ring-destructive/10" : "border-border focus:ring-success/10 focus:border-success"
                                        )}
                                    />
                                </div>
                                {errors.amount && <p className="text-[10px] font-black text-destructive ml-1 mt-1 uppercase tracking-widest">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-widest">Payment Method</label>
                                <div className="relative group">
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        className="w-full bg-muted/50 border border-border rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all text-foreground appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-widest">Session Term</label>
                                <div className="relative group">
                                    <select
                                        name="term"
                                        value={formData.term}
                                        onChange={handleChange}
                                        className="w-full bg-muted/50 border border-border rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all text-foreground appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="summer">Summer Term</option>
                                        <option value="winter">Winter Term</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-widest">Academic Year</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-success transition-colors" />
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all text-foreground appearance-none cursor-pointer"
                                    >
                                        {[...Array(5)].map((_, i) => {
                                            const y = new Date().getFullYear() - i;
                                            return <option key={y} value={y}>{y}</option>;
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground ml-1 uppercase tracking-widest">Additional Notes</label>
                            <div className="relative group">
                                <Info className="absolute left-5 top-5 w-4 h-4 text-muted-foreground group-focus-within:text-success transition-colors" />
                                <textarea
                                    name="payment_details"
                                    value={formData.payment_details}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="e.g. Transaction ID, Check Number, or special notes..."
                                    className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all text-foreground resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-6 pt-10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-xs font-black text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                            Cancel & Exit
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-5 bg-success text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-success transition-all shadow-xl shadow-success/20 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
