'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
    UserCircle,
    Phone,
    MapPin,
    Calendar,
    BadgeCheck,
    ShieldCheck,
    Pencil,
    Activity
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <AlertCircle className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-bold">Record Not Found</h3>
                <Link href="/students" className="text-primary hover:underline mt-2">Return to Directory</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/students" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-bold transition-all mb-4 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Students
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                            <Pencil className="w-6 h-6 text-white" />
                        </div>
                        Update Student Records
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Modifying record for <span className="text-primary font-black tracking-wide uppercase font-mono">{grNo}</span></p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-secondary dark:bg-zinc-900 rounded-2xl border border-border self-start md:self-center">
                    <Activity className="w-4 h-4 text-success" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">Edit Mode Active</span>
                </div>
            </div>

            {/* Main Form Card */}
            <div className={cn(
                "relative bg-card rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-sm",
                success ? "border-success shadow-2xl shadow-success/10" : "border-border"
            )}>
                {success ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-2xl shadow-success/20">
                            <Check className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-foreground">Profile Synchronized</h3>
                            <p className="text-muted-foreground text-sm font-bold">Academic record successfully modified. Redirecting...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-12 space-y-10">
                        {/* Personal Info Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-border/50">
                                <UserCircle className="w-5 h-5 text-primary" />
                                <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Record Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">First Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                            errors.name
                                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                : "border-border focus:ring-primary/10 focus:border-primary"
                                        )}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Father Name</label>
                                    <input
                                        name="father_name"
                                        value={form.father_name}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                            errors.father_name
                                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                : "border-border focus:ring-primary/10 focus:border-primary"
                                        )}
                                    />
                                    {errors.father_name && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.father_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Surname</label>
                                    <input
                                        name="surname"
                                        value={form.surname}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                            errors.surname
                                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                : "border-border focus:ring-primary/10 focus:border-primary"
                                        )}
                                    />
                                    {errors.surname && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.surname}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Bio & Contact Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-border/50">
                                <Phone className="w-5 h-5 text-success" />
                                <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Communication & Age</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Mobile</label>
                                    <input
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground font-mono",
                                            errors.mobile
                                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                : "border-border focus:ring-primary/10 focus:border-primary"
                                        )}
                                    />
                                    {errors.mobile && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.mobile}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Date of Birth</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary pointer-events-none transition-colors" />
                                        <input
                                            type="date"
                                            name="dob"
                                            value={form.dob}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full bg-muted/50/50 border rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                                errors.dob
                                                    ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                    : "border-border focus:ring-primary/10 focus:border-primary"
                                            )}
                                        />
                                    </div>
                                    {errors.dob && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.dob}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-border/50">
                                <ShieldCheck className="w-5 h-5 text-purple-500" />
                                <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Academic Status</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Current Standing</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full appearance-none bg-muted/50/50 border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground cursor-pointer"
                                    >
                                        <option value="active">ACTIVE</option>
                                        <option value="terminated">TERMINATED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-border/50">
                                <MapPin className="w-5 h-5 text-amber-500" />
                                <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Address Profile</h2>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Address Detail</label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={form.address}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground resize-none",
                                            errors.address
                                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                : "border-border focus:ring-primary/10 focus:border-primary"
                                        )}
                                    />
                                    {errors.address && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">City</label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                                errors.city
                                                    ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                    : "border-border focus:ring-primary/10 focus:border-primary"
                                            )}
                                        />
                                        {errors.city && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Zip Code</label>
                                        <input
                                            name="zip_code"
                                            value={form.zip_code}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full bg-muted/50/50 border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all text-foreground",
                                                errors.zip_code
                                                    ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                                    : "border-border focus:ring-primary/10 focus:border-primary"
                                            )}
                                        />
                                        {errors.zip_code && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1">{errors.zip_code}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback & Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-border/50">
                            {error && (
                                <div className="flex items-center gap-3 text-destructive px-5 py-3 bg-destructive/10 border border-destructive/20 rounded-2xl animate-shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-xs font-black uppercase tracking-wide leading-tight">{error}</p>
                                </div>
                            )}
                            <div className="hidden md:block" />

                            <div className="flex items-center gap-4">
                                <Link href="/students" className="px-8 py-4 text-muted-foreground hover:text-zinc-900 dark:hover:text-white text-sm font-black uppercase tracking-widest transition-all">
                                    Discard
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-12 py-4 bg-primary text-white rounded-[1.25rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary/90 shadow-2xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            Update Academic File
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <EditStudentForm />
        </Suspense>
    );
}
