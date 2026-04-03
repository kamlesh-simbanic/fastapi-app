'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    ChevronLeft,
    Save,
    User,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    Briefcase,
    MapPin,
    GraduationCap,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEPARTMENTS, QUALIFICATIONS, getDepartmentColor } from '@/lib/departments';
import CalendarPicker from '@/components/CalendarPicker';
import { ConfirmBox } from '@/components/ConfirmBox';

function EditStaffForm() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const staffId = searchParams.get('id');

    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        dob: '',
        department: 'teaching',
        qualification: 'B.Sc.',
        address: '',
        city: '',
        zip_code: '',
        leave_balance: 20,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchStaffDetails = useCallback(async () => {
        try {
            setFetching(true);
            const data = await api.getStaffById(Number(staffId));
            setFormData({
                name: data.name || '',
                email: data.email || '',
                mobile: data.mobile || '',
                dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                department: data.department || 'teaching',
                qualification: data.qualification || 'B.Sc.',
                address: data.address || '',
                city: data.city || '',
                zip_code: data.zip_code || '',
                leave_balance: data.leave_balance ?? 20,
            });
        } catch (err) {
            console.error('Failed to fetch staff:', err);
            setError('Failed to load staff details.');
        } finally {
            setFetching(false);
        }
    }, [staffId]);

    useEffect(() => {
        if (staffId && user) {
            fetchStaffDetails();
        }
    }, [staffId, user, fetchStaffDetails]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) newErrors.dob = 'Staff must be at least 18 years old';
        }

        if (!formData.qualification) newErrors.qualification = 'Qualification is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';

        if (!formData.zip_code) {
            newErrors.zip_code = 'Zip code is required';
        } else if (!/^\d{6}$/.test(formData.zip_code)) {
            newErrors.zip_code = 'Zip code must be 6 digits';
        }

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
            await api.updateStaff(Number(staffId), formData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/staff');
            }, 2000);
        } catch (err: unknown) {
            console.error('Failed to update staff:', err);
            const message = err instanceof Error ? err.message : 'Failed to update staff member. Please check all fields.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);

        try {
            await api.deleteStaff(Number(staffId));
            router.push('/staff');
        } catch (err) {
            console.error('Failed to delete staff:', err);
            setError('Failed to delete staff member. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (!user) return null;

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-zinc-500 text-sm font-bold animate-pulse">Synchronizing profile details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <section className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        onClick={() => router.push('/staff')}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-4 group font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Directory
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Modify Member Profile
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                        Update professional credentials or personal records for <span className="text-blue-600 font-bold">{formData.name}</span>.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors active:scale-95 disabled:opacity-50 border border-transparent hover:border-red-500/20"
                        title="Decommission Profile"
                    >
                        {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>
            </section>

            {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Information Updated</h2>
                    <p className="text-zinc-500 font-medium">The member profile has been synchronized successfully. Redirecting...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3 animate-in shake duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {/* Identity Profile */}
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-bold text-zinc-900 dark:text-white pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            Identity Profile
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-medium",
                                            errors.name
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Official Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. john@example.com"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-medium",
                                            errors.email
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Mobile Contact</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-medium",
                                            errors.mobile
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                </div>
                                {errors.mobile && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.mobile}</p>}
                            </div>

                            <div className="space-y-2">
                                <CalendarPicker
                                    label="Birth Date"
                                    value={formData.dob}
                                    onChange={(date) => {
                                        setFormData(prev => ({ ...prev, dob: date }));
                                        if (errors.dob) {
                                            setErrors(prev => {
                                                const updated = { ...prev };
                                                delete updated.dob;
                                                return updated;
                                            });
                                        }
                                    }}
                                    maxDate={new Date().toISOString().split('T')[0]}
                                    error={errors.dob}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Workplace Details */}
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-bold text-zinc-900 dark:text-white pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors border",
                                getDepartmentColor(formData.department).replace('indigo', 'blue')
                            )}>
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            Workplace Details
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Department</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer font-medium"
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Highest Qualification</label>
                                <div className="relative group">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                                    <select
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer font-medium"
                                    >
                                        {QUALIFICATIONS.map(qual => (
                                            <option key={qual.value} value={qual.value}>{qual.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Leave Balance (Days)</label>
                                <div className="relative group">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                                    <input
                                        type="number"
                                        name="leave_balance"
                                        value={formData.leave_balance}
                                        readOnly
                                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed opacity-80 font-medium"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-zinc-400 ml-1 mt-1 uppercase tracking-wider italic">Protected by System Administration.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-lg font-bold text-zinc-900 dark:text-white pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <MapPin className="w-5 h-5 text-orange-500" />
                            </div>
                            Contact & Address
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Residential Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="e.g. 123 Main St, Apartment 4B"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white resize-none font-medium",
                                            errors.address
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                </div>
                                {errors.address && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">City</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. New York"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-medium",
                                            errors.city
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                    {errors.city && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.city}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Zip Code</label>
                                    <input
                                        name="zip_code"
                                        value={formData.zip_code}
                                        onChange={handleChange}
                                        placeholder="e.g. 110001"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white font-medium",
                                            errors.zip_code
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-blue-600/5 focus:border-blue-600"
                                        )}
                                    />
                                    {errors.zip_code && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.zip_code}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-6">
                        <div className="flex items-center gap-3 text-lg font-bold text-red-800 dark:text-red-400">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Critical Zone
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Removing this profile will permanently erase all associated academic records and historical data from the system.</p>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            Decommission Profile
                        </button>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => router.push('/staff')}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Synchronize Records
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Confirm Delete */}
            <ConfirmBox
                isOpen={showDeleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                title="Decommission Profile"
                description={`Are you absolutely sure you want to remove ${formData.name}? This action is irreversible and will purge all staff data.`}
                confirmText="Permanent Delete"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}

export default function EditStaffPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        }>
            <EditStaffForm />
        </Suspense>
    );
}
