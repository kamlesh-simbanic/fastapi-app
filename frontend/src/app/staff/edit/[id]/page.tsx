'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    Users,
    ArrowLeft,
    Save,
    Loader2,
    Mail,
    Phone,
    User,
    Calendar,
    Briefcase,
    GraduationCap,
    MapPin,
    Building2,
    CheckCircle2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEPARTMENTS, QUALIFICATIONS, getDepartmentColor } from '@/lib/departments';

interface FormErrors {
    [key: string]: string;
}

export default function EditStaffPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        dob: '',
        department: '',
        qualification: '',
        address: '',
        city: '',
        zip_code: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchStaff = async () => {
            try {
                const data = await api.getStaffById(id as string);
                setFormData({
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email,
                    dob: new Date(data.dob).toISOString().split('T')[0],
                    department: data.department,
                    qualification: data.qualification,
                    address: data.address,
                    city: data.city,
                    zip_code: data.zip_code
                });
            } catch (err: any) {
                setError(err.message || 'Failed to fetch staff data');
            } finally {
                setLoading(false);
            }
        };

        if (user && id) fetchStaff();
    }, [id, user, authLoading, router]);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Full Name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const mobileRegex = /^\d{10}$/;
        if (!formData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!mobileRegex.test(formData.mobile)) {
            newErrors.mobile = 'Mobile must be 10 digits';
        }

        if (!formData.dob) newErrors.dob = 'Date of Birth is required';
        else {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) newErrors.dob = 'Staff must be at least 18 years old';
        }

        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.qualification) newErrors.qualification = 'Qualification is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';

        if (!formData.zip_code) {
            newErrors.zip_code = 'Zip Code is required';
        } else if (!/^\d{6}$/.test(formData.zip_code)) {
            newErrors.zip_code = 'Zip Code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await api.updateStaff(id as string, formData);
            setSuccess(true);
            setTimeout(() => router.push('/staff'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update staff member');
            setSubmitting(false);
        }
    };

    const deptColorClass = getDepartmentColor(formData.department);
    // Parse color class parts for separate usage since we moved to a single string constant
    const bgClass = deptColorClass.split(' ')[0];
    const textClass = deptColorClass.split(' ')[1];
    const borderClass = deptColorClass.split(' ')[2];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="font-medium animate-pulse">Loading staff profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium group mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Directory
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            Edit Staff Member
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium ml-1">
                            Updating profile for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formData.name || 'Staff member'}</span>
                        </p>
                    </div>
                </div>

                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Update Successful!</h3>
                            <p className="opacity-90">The profile has been updated. Redirecting you to the directory...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-center gap-4 text-red-600 dark:text-red-400 animate-in slide-in-from-top-4 duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Update Failed</h3>
                            <p className="opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 1: Personal Details */}
                    <div className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-zinc-500" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Personal Information</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                        className={cn(
                                            "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                            errors.name
                                                ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                        )}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Date of Birth</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white appearance-none",
                                                errors.dob
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                    {errors.dob && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.dob}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Academic Degree</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                                        <select
                                            required
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Degree</option>
                                            {QUALIFICATIONS.map(deg => (
                                                <option key={deg.value} value={deg.value}>{deg.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                    {errors.qualification && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.qualification}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Details */}
                    <div className={cn(
                        "space-y-6 p-8 rounded-[2.5rem] border transition-all duration-500 shadow-sm relative overflow-hidden group",
                        bgClass, borderClass
                    )}>
                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-10 -mt-10 opacity-20", textClass)} />

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                                <Briefcase className={cn("w-4 h-4", textClass)} />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Job Assignment</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Department</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {DEPARTMENTS.map((dept) => {
                                        if (!dept.value) return null; // Skip "All Departments" in add/edit form
                                        const isActive = formData.department === dept.value;
                                        const dColorClass = getDepartmentColor(dept.value);
                                        const dBg = dColorClass.split(' ')[0];
                                        const dText = dColorClass.split(' ')[1];
                                        const dBorder = dColorClass.split(' ')[2];

                                        return (
                                            <button
                                                key={dept.value}
                                                type="button"
                                                onClick={() => handleChange({ target: { name: 'department', value: dept.value } } as any)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-xs font-bold transition-all duration-300",
                                                    isActive
                                                        ? `${dBg} ${dBorder} ${dText} scale-[1.02] shadow-md`
                                                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200"
                                                )}
                                            >
                                                <Building2 className={cn("w-3.5 h-3.5", isActive ? "" : "text-zinc-300")} />
                                                {dept.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.department && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.department}</p>}
                            </div>

                            <div className="space-y-2 bg-white/40 dark:bg-black/10 p-5 rounded-3xl border border-white/60 dark:border-white/5 mt-4">
                                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                    Security Note
                                </p>
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                                    Updating a staff member's information does not reset their password. To change a password, please use the account security module.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Contact Details */}
                    <div className="md:col-span-2 space-y-6 bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full -ml-20 -mb-20" />

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-zinc-500" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Communication & Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="e.g. j.doe@school.com"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.email
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="10 digit number"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.mobile
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                    {errors.mobile && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.mobile}</p>}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Full Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <textarea
                                            required
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="e.g. 123 Main St, Apartment 4B"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white resize-none",
                                                errors.address
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                    </div>
                                    {errors.address && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">City</label>
                                        <input
                                            required
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.city
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.city && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Zip Code</label>
                                        <input
                                            required
                                            type="text"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleChange}
                                            placeholder="6 digits"
                                            className={cn(
                                                "w-full bg-zinc-50 dark:bg-zinc-950 border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white",
                                                errors.zip_code
                                                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"
                                            )}
                                        />
                                        {errors.zip_code && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.zip_code}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all font-sans"
                        >
                            Cancel Changes
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || success}
                            className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            )}
                            {submitting ? 'Updating...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
