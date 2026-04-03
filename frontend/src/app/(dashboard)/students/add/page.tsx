'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Users,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    UserCircle,
    Phone,
    MapPin,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import CalendarPicker from '@/components/CalendarPicker';

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
    const { user } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    const handleDateChange = (date: string) => {
        setForm(prev => ({ ...prev, dob: date }));
        if (errors.dob) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated.dob;
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

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/students" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-600 text-sm font-semibold transition-all mb-2 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Students
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        New Student Enrollment
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Please enter the student&apos;s details to create a new academic profile.</p>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 self-start md:self-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Environment Ready</span>
                </div>
            </div>

            {/* Main Form Card */}
            <div className={cn(
                "relative bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-500 overflow-hidden shadow-sm",
                success ? "border-emerald-500 shadow-2xl shadow-emerald-500/10" : "border-zinc-200 dark:border-zinc-800"
            )}>
                {success ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Enrollment Successful</h3>
                            <p className="text-zinc-500 text-sm font-medium">The student record has been added to the database.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-12">
                        {/* Personal Info Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <UserCircle className="w-4.5 h-4.5 text-blue-600" />
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">First Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100",
                                            errors.name
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                        )}
                                    />
                                    {errors.name && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Father&apos;s Name</label>
                                    <input
                                        name="father_name"
                                        value={form.father_name}
                                        onChange={handleChange}
                                        placeholder="Enter father's name"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100",
                                            errors.father_name
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                        )}
                                    />
                                    {errors.father_name && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.father_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Surname</label>
                                    <input
                                        name="surname"
                                        value={form.surname}
                                        onChange={handleChange}
                                        placeholder="Enter surname"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100",
                                            errors.surname
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                        )}
                                    />
                                    {errors.surname && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.surname}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Birth Details */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <Phone className="w-4.5 h-4.5 text-emerald-600" />
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Contact & Birth Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Mobile Number</label>
                                    <input
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 font-mono",
                                            errors.mobile
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                        )}
                                    />
                                    {errors.mobile && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.mobile}</p>}
                                </div>
                                <div className="space-y-2">
                                    <CalendarPicker
                                        label="Date of Birth"
                                        value={form.dob}
                                        onChange={handleDateChange}
                                        error={errors.dob}
                                        placeholder="Choose student's DOB"
                                        maxDate={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <MapPin className="w-4.5 h-4.5 text-amber-600" />
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Address Details</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Residence Address</label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="House No, Street, Landmark..."
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 resize-none",
                                            errors.address
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                        )}
                                    />
                                    {errors.address && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">City</label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="Enter city"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100",
                                                errors.city
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                            )}
                                        />
                                        {errors.city && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Pin Code</label>
                                        <input
                                            name="zip_code"
                                            value={form.zip_code}
                                            onChange={handleChange}
                                            placeholder="6 digits"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950/30 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-zinc-100 font-mono",
                                                errors.zip_code
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600/50"
                                            )}
                                        />
                                        {errors.zip_code && <p className="text-[11px] font-medium text-red-500 ml-1">{errors.zip_code}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
                            {error && (
                                <div className="flex items-center gap-3 text-red-600 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl animate-in fade-in duration-300">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-xs font-semibold leading-tight">{error}</p>
                                </div>
                            )}
                            <div className="flex-1" />

                            <div className="flex items-center gap-4">
                                <Link href="/students" className="px-6 py-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 text-sm font-bold transition-all">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-10 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Register Student
                                            <Check className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Hint Note */}
            <div className="flex items-start gap-4 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Data Integrity Note</h4>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        A unique <span className="text-blue-600 font-bold">GR Number</span> will be automatically assigned to the student upon successful registration.
                        Please ensure all identity details are accurate according to official records.
                    </p>
                </div>
            </div>
        </div>
    );
}
