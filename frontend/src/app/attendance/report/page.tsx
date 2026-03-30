'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    Calendar,
    Users,
    Loader2,
    ChevronDown,
    AlertCircle,
    FileText,
    Printer
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface StudentReport {
    student_id: number;
    name: string;
    data: Record<string, string>; // day -> "present" | "absent"
}

export default function AttendanceReportPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [reportData, setReportData] = useState<StudentReport[]>([]);

    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchClasses = useCallback(async () => {
        setClassesLoading(true);
        try {
            const data = await api.getClasses({ limit: 100 });
            setClasses(data.items);
        } catch {
            setError('Failed to load classes.');
        } finally {
            setClassesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchClasses();
        }
    }, [fetchClasses, user]);

    const fetchReport = useCallback(async () => {
        if (!selectedClass) {
            setReportData([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await api.getMonthlyReport({
                month,
                year,
                class_id: selectedClass
            });
            setReportData(data);
        } catch {
            setError('Failed to load attendance report.');
        } finally {
            setLoading(false);
        }
    }, [month, year, selectedClass]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const daysInMonth = useMemo(() => {
        return new Date(year, month, 0).getDate();
    }, [year, month]);

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-20 print:pb-0">
                {/* Print-only Header */}
                <div className="hidden print:block mb-6 border-b-2 border-zinc-900 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900">
                        Monthly Attendance Report
                    </h1>
                    <div className="flex justify-between mt-4 font-bold text-sm">
                        <span>Class: Standard {classes.find(c => c.id.toString() === selectedClass)?.standard} - {classes.find(c => c.id.toString() === selectedClass)?.division}</span>
                        <span>Period: {months[month - 1]} {year}</span>
                    </div>
                </div>

                {/* Header (Screen only) */}
                <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-space print:hidden">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Monthly Report
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">Detailed monthly student presence matrix.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/attendance"
                            className="px-4 py-2 text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-500 transition-colors"
                        >
                            Back to Marking
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2 print:hidden">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Filters (Screen only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm print:hidden">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Period
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="flex-1 appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-24 appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3 h-3" /> Class
                        </label>
                        <div className="relative">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                disabled={classesLoading}
                                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Choose a class...</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Standard {cls.standard} - {cls.division}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden print:shadow-none print:border-none print:overflow-visible">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="font-bold text-sm tracking-widest uppercase opacity-70">Generating report matrix...</p>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center italic">
                            <FileText className="w-16 h-16 text-zinc-200 dark:text-zinc-800" />
                            <div>
                                <h3 className="text-xl font-bold text-zinc-400">No data available</h3>
                                <p className="text-zinc-400 text-sm max-w-sm mx-auto">Select a class and period to view the attendance report.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto max-h-[700px] print:overflow-visible print:max-h-none">
                            <table className="w-full text-left border-collapse min-w-[max-content] print:min-w-0">
                                <thead className="sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-900 shadow-sm print:static">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sticky left-0 z-30 min-w-[200px]">
                                            Student Name
                                        </th>
                                        {daysArray.map(day => (
                                            <th key={day} className="px-2 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center min-w-[35px] border-r border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-default transition-colors">
                                                {day}
                                            </th>
                                        ))}
                                        <th className="px-4 py-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center min-w-[80px]">
                                            Summary
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {reportData.map((student) => {
                                        const pCount = Object.values(student.data).filter(s => s === 'present').length;
                                        const totalDays = Object.values(student.data).length;
                                        const percent = totalDays > 0 ? Math.round((pCount / totalDays) * 100) : 0;

                                        return (
                                            <tr key={student.student_id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                                <td className="px-6 py-3 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky left-0 z-10 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 Transition-all duration-300">
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 italic truncate max-w-[180px]">
                                                        {student.name}
                                                    </p>
                                                </td>
                                                {daysArray.map(day => {
                                                    const status = student.data[day.toString()];
                                                    return (
                                                        <td key={day} className="px-2 py-3 border-r border-zinc-200 dark:border-zinc-800 last:border-0 text-center">
                                                            {status === 'present' ? (
                                                                <div className="w-5 h-5 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-black mx-auto shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/20">P</div>
                                                            ) : status === 'absent' ? (
                                                                <div className="w-5 h-5 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center text-[10px] font-black mx-auto ring-1 ring-red-500/20 animate-pulse-slow">A</div>
                                                            ) : (
                                                                <div className="w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto opacity-30" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={cn(
                                                            "text-xs font-black",
                                                            percent > 75 ? "text-emerald-500" : percent > 40 ? "text-amber-500" : "text-red-500"
                                                        )}>
                                                            {percent}%
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 font-bold">{pCount}/{totalDays}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 justify-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded" />
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded" />
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                        <span>No Record</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
