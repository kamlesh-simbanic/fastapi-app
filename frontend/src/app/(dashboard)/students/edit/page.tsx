'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    UserCircle,
    Phone,
    MapPin,
    BadgeCheck,
    ShieldCheck,
    Pencil,
    Activity
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

function EditStudentForm() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState<FormState | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fetching, setFetching] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [grNo, setGrNo] = useState<string>('');

    useEffect(() => {
        if (id && user) {
            const fetchStudent = async () => {
                setFetching(true);
                try {
                    const data = await api.getStudentById(id as string);
                    setGrNo(data.gr_no);
                    setForm({
                        name: data.name,
                        father_name: data.father_name,
                        surname: data.surname,
                        mobile: data.mobile,
                        dob: data.dob,
                        address: data.address,
                        city: data.city,
                        zip_code: data.zip_code,
                        status: data.status,
                    });
                } catch (err: unknown) {
                    console.error('Failed to load student:', err);
                    setError('Unable to locate academic record.');
                } finally {
                    setFetching(false);
                }
            };
            fetchStudent();
        }
    }, [id, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => prev ? ({ ...prev, [name]: value }) : null);
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
        setForm(prev => prev ? ({ ...prev, dob: date }) : null);
        if (errors.dob) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated.dob;
                return updated;
            });
        }
    };

    const validateForm = () => {
        if (!form) return false;
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

        if (!form || !id) return;

        setSubmitting(true);
        setError(null);

        try {
            await api.updateStudent(id as string, form);
            setSuccess(true);
            setTimeout(() => {
                router.push('/students');
            }, 1000);
        } catch (err: unknown) {
            console.error('Update failed:', err);
            const msg = err instanceof Error ? err.message : 'Failed to update academic profile.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (fetching || !user) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <AlertCircle className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-bold">Record Not Found</h3>
                <Link href="/students" className="text-blue-600 hover:underline mt-2">Return to Directory</Link>
            </div>
        );
    }

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
                            <Pencil className="w-5 h-5 text-white" />
                        </div>
                        Edit Student Record
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Modifying record for <span className="text-blue-600 font-bold font-mono tracking-tight">{grNo}</span></p>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 self-start md:self-center transition-colors">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Edit Mode Active</span>
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
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Changes Saved</h3>
                            <p className="text-zinc-500 text-sm font-medium">The academic record has been updated successfully.</p>
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

                        {/* Status Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Academic Status</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">Enrollment Status</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="terminated">Terminated</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-400">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
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
                                    Discard Changes
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-10 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <BadgeCheck className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function EditStudentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        }>
            <EditStudentForm />
        </Suspense>
    );
}
