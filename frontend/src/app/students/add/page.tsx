'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    Users,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    UserCircle,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FormState {
    name: string;
    father_name: string;
    surname: string;
    mobile: string;
    dob: string;
    address: string;
    city: string;
    zip_code: string;
    status: 'active' | 'terminated';
    [key: string]: unknown;
}

const INITIAL_STATE: FormState = {
    name: '',
    father_name: '',
    surname: '',
    mobile: '',
    dob: '',
    address: '',
    city: '',
    zip_code: '',
    status: 'active',
};

export default function AddStudentPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

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

        if (!form.name.trim()) newErrors.name = "First name is required.";
        if (!form.father_name.trim()) newErrors.father_name = "Father's name is required.";
        if (!form.surname.trim()) newErrors.surname = "Surname is required.";

        if (!form.mobile) {
            newErrors.mobile = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(form.mobile)) {
            newErrors.mobile = "Mobile number must be 10 digits.";
        }

        if (!form.dob) {
            newErrors.dob = "Date of birth is required.";
        } else {
            const birthDate = new Date(form.dob);
            const today = new Date();
            if (birthDate > today) newErrors.dob = "Date of birth cannot be in the future.";
        }

        if (!form.address.trim()) newErrors.address = "Address is required.";
        if (!form.city.trim()) newErrors.city = "City is required.";
        if (!form.zip_code.trim()) newErrors.zip_code = "Zip code is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setError(null);

        try {
            await api.addStudent(form);
            setSuccess(true);
            setTimeout(() => {
                router.push('/students');
            }, 1500);
        } catch (err: unknown) {
            console.error('Registration failed:', err);
            const msg = err instanceof Error ? err.message : 'Failed to register student. Please check the details.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <Link href="/students" className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-500 text-sm font-bold transition-all mb-4 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Students
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            Admission Portal
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Registers a new academic profile into the central system.</p>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 self-start md:self-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">System Ready</span>
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
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Admission Successful</h3>
                                <p className="text-zinc-500 text-sm font-bold">The student record has been cataloged. Redirecting...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-12 space-y-10">
                            {/* Personal Info Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <UserCircle className="w-5 h-5 text-indigo-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Identity Profile</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">First Name</label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="John"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.name
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Father Name</label>
                                        <input
                                            name="father_name"
                                            value={form.father_name}
                                            onChange={handleChange}
                                            placeholder="David"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.father_name
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.father_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.father_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Surname</label>
                                        <input
                                            name="surname"
                                            value={form.surname}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.surname
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.surname && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.surname}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Bio & Contact Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <Phone className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Contact & Birth</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Mobile Access</label>
                                        <input
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-mono",
                                                errors.mobile
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.mobile && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.mobile}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Date of Birth</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" />
                                            <input
                                                type="date"
                                                name="dob"
                                                value={form.dob}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                    errors.dob
                                                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                        : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                )}
                                            />
                                        </div>
                                        {errors.dob && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.dob}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <MapPin className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Geospatial Data</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Full Primary Address</label>
                                        <textarea
                                            name="address"
                                            rows={2}
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="Unit 7, Academic Court..."
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white resize-none",
                                                errors.address
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.address && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Settlement/City</label>
                                            <input
                                                name="city"
                                                value={form.city}
                                                onChange={handleChange}
                                                placeholder="Oxford"
                                                className={cn(
                                                    "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                    errors.city
                                                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                        : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                )}
                                            />
                                            {errors.city && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Postal Code</label>
                                            <input
                                                name="zip_code"
                                                value={form.zip_code}
                                                onChange={handleChange}
                                                placeholder="6 digits code"
                                                className={cn(
                                                    "w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-mono uppercase tracking-widest",
                                                    errors.zip_code
                                                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                        : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                )}
                                            />
                                            {errors.zip_code && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.zip_code}</p>}
                                        </div>
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
                                    <Link href="/students" className="px-8 py-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-black uppercase tracking-widest transition-all">
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-12 py-4 bg-indigo-500 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                Confirm Admission
                                                <Check className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-4 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50">
                    <ShieldCheck className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Automatic Cataloging</h4>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                            A unique <span className="text-indigo-500 font-bold tracking-widest uppercase">GR Number</span> will be automatically generated upon submission based on the current academic cycle.
                            Ensure the Name and Father&apos;s Name exactly match supporting identification.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
