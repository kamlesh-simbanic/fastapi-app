'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    ChevronDown,
    AlertCircle,
    ClipboardCheck,
    FileText,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import CalendarPicker from '@/components/CalendarPicker';
import { cn } from '@/lib/utils';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface Student {
    id: number;
    gr_no: string;
    name: string;
    surname: string;
}

export default function AttendancePage() {
    const { user } = useAuth();

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<number, string>>({});
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedDateIsHoliday, setSelectedDateIsHoliday] = useState(false);

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

    const fetchStudents = useCallback(async (classId: string) => {
        if (!classId) {
            setStudents([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await api.getStudentsByClass(classId);
            setStudents(data);

            // Initialize attendance (default all Present)
            const initialAttendance: Record<number, string> = {};
            data.forEach((s: Student) => {
                initialAttendance[s.id] = 'P';
            });
            setAttendance(initialAttendance);
        } catch {
            setError('Failed to load students for the selected class.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAttendance = useCallback(async (classId: string, attendanceDate: string) => {
        if (!classId || !attendanceDate) return;

        try {
            const data = await api.getAttendance({ class_id: classId, day: attendanceDate });
            if (data && data.length > 0) {
                const existing = data[0]; // Should be only one record per class/date
                const attendanceMap: Record<number, string> = {};
                existing.records.forEach((r: { student_id: number; status: string }) => {
                    attendanceMap[r.student_id] = r.status;
                });
                setAttendance(prev => ({ ...prev, ...attendanceMap }));
            }
        } catch (err) {
            console.error('Failed to fetch existing attendance:', err);
        }
    }, []);

    const checkIsInvalidDate = useCallback((dateString: string) => {
        const d = new Date(dateString);
        if (!isNaN(d.getTime())) {
            // Sunday check
            if (d.getUTCDay() === 0) return { invalid: true, reason: 'Sundays are holidays' };

            // Holiday check (using state from Calendar)
            if (selectedDateIsHoliday) {
                return { invalid: true, reason: 'This date is a institutional holiday' };
            }
        }
        return { invalid: false };
    }, [selectedDateIsHoliday]);

    useEffect(() => {
        const loadPageData = async () => {
            const dateStatus = checkIsInvalidDate(date);
            if (dateStatus.invalid) {
                setStudents([]);
                setError(`Attendance cannot be recorded: ${dateStatus.reason}`);
                return;
            }

            if (selectedClass) {
                await fetchStudents(selectedClass);
                await fetchAttendance(selectedClass, date);
            }
        };
        loadPageData();
    }, [selectedClass, date, fetchStudents, fetchAttendance, checkIsInvalidDate]);

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const toggleAll = (present: boolean) => {
        const newAttendance: Record<number, string> = {};
        students.forEach(s => {
            newAttendance[s.id] = present ? 'P' : 'A';
        });
        setAttendance(newAttendance);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) {
            setError('Please select a target class.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const recordsArray = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: parseInt(studentId),
                status
            }));

            await api.submitAttendance({
                date,
                class_id: parseInt(selectedClass),
                records: recordsArray
            });
            setSuccess('Registry successfully updated!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to record attendance.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                        <ClipboardCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white flex items-center gap-4 italic tracking-tight uppercase">
                            Registry Input
                        </h1>
                        <p className="text-primary-main/60 font-black text-[10px] uppercase tracking-[0.3em] italic leading-none">Attendance Management Protocol</p>
                    </div>
                </div>

                <Link
                    href="/attendance/report"
                    className="px-8 py-4 bg-surface-paper dark:bg-zinc-800 text-zinc-500 hover:text-primary-main border border-zinc-100 dark:border-zinc-700 rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-sm hover:shadow-xl group italic ring-1 ring-zinc-50 dark:ring-zinc-800/10"
                >
                    <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Archive Analysis
                </Link>
            </section>

            {error && (
                <div className="p-6 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center gap-5 text-error animate-in slide-in-from-top-2 shadow-sm font-black uppercase tracking-widest italic text-[11px]">
                    <div className="w-10 h-10 rounded-radius-medium bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    {error}
                </div>
            )}

            {success && (
                <div className="p-6 rounded-radius-medium bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-5 text-primary-main animate-in slide-in-from-top-2 shadow-sm font-black uppercase tracking-widest italic text-[11px]">
                    <div className="w-10 h-10 rounded-radius-medium bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    {success}
                </div>
            )}

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-surface-paper dark:bg-zinc-900 p-12 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-main/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />

                <div className="space-y-4 z-10 flex flex-col justify-end">
                    <CalendarPicker
                        label="Evaluation Epoch (Date)"
                        value={date}
                        onChange={(d, isHoliday) => {
                            setDate(d);
                            setSelectedDateIsHoliday(!!isHoliday);
                        }}
                        maxDate={new Date().toISOString().split('T')[0]}
                        disableHolidays={true}
                        shouldDisableDate={(d) => d.getDay() === 0}
                        error={checkIsInvalidDate(date).invalid ? checkIsInvalidDate(date).reason?.toUpperCase() : undefined}
                    />
                </div>

                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-2 ml-1 italic leading-none">
                        <Users className="w-4 h-4 text-primary-main" /> Target Academic Unit
                    </label>
                    <div className="relative group">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={classesLoading}
                            className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-zinc-100 cursor-pointer disabled:opacity-50 italic uppercase tracking-wider"
                        >
                            <option value="">Select Target Unit...</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    Standard {cls.standard.toUpperCase()} &ndash; {cls.division.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-hover:text-primary-main transition-colors pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-44 gap-8 text-zinc-500 animate-in fade-in duration-700">
                        <Loader2 className="w-20 h-20 text-primary-main animate-spin" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-[11px] tracking-[0.5em] uppercase opacity-70 italic">Synchronizing Roster Streams...</p>
                            <p className="text-[10px] font-black text-zinc-400 animate-pulse italic uppercase tracking-widest leading-none">Accessing Central Registry</p>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    selectedClass ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-8 bg-surface-ground dark:bg-zinc-950/30 rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in scale-in-95">
                            <div className="w-24 h-24 rounded-radius-large bg-surface-paper dark:bg-zinc-800 flex items-center justify-center border border-zinc-50 dark:border-zinc-700 shadow-inner">
                                <Users className="w-12 h-12 text-zinc-100 dark:text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tight uppercase leading-none">Unit Roster Vacant</h3>
                                <p className="text-zinc-500 text-[10px] max-w-xs font-black italic uppercase tracking-widest leading-relaxed opacity-60">No academic members are currently deployed in this specific unit.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-44 gap-10 bg-surface-ground/30 dark:bg-zinc-900/10 rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-700">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-main/10 rounded-full blur-[100px] animate-pulse"></div>
                                <div className="relative w-28 h-28 rounded-radius-large bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                                    <ClipboardCheck className="w-14 h-14 text-primary-main opacity-20" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight italic uppercase">Awaiting Selection</h3>
                                <p className="text-zinc-500 text-[10px] max-w-sm mx-auto font-black italic uppercase tracking-[0.3em] leading-loose opacity-60">Define a target unit from the configuration registry above to initialize the attendance input flow.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                            <div className="space-y-2">
                                <h2 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white tracking-tight italic uppercase leading-none">Unit Roster</h2>
                                <p className="text-[10px] font-black text-primary-main uppercase tracking-[0.4em] italic leading-none">{students.length.toString().padStart(2, '0')} Members Detected</p>
                            </div>
                            <div className="flex items-center gap-4 bg-surface-paper dark:bg-zinc-900 p-2 rounded-radius-medium border border-zinc-200 dark:border-zinc-800 shadow-sm ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                                <button
                                    onClick={() => toggleAll(true)}
                                    className="px-6 py-2.5 text-[9px] font-black text-primary-main uppercase tracking-[0.4em] hover:bg-primary-main/5 rounded-radius-medium transition-all active:scale-95 italic"
                                >
                                    Force Present
                                </button>
                                <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800"></div>
                                <button
                                    onClick={() => toggleAll(false)}
                                    className="px-6 py-2.5 text-[9px] font-black text-error uppercase tracking-[0.4em] hover:bg-error/5 rounded-radius-medium transition-all active:scale-95 italic"
                                >
                                    Force Absent
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-radius-large border border-zinc-200 dark:border-zinc-800 bg-surface-paper dark:bg-zinc-950 shadow-sm relative ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                            <div className="overflow-x-auto text-[10px]">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead className="bg-surface-ground">
                                        <tr>
                                            <th className="px-10 py-6 font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-zinc-100 dark:border-zinc-800 italic">Academic Member Identity</th>
                                            <th className="px-10 py-6 font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-zinc-100 dark:border-zinc-800 text-right italic">Status Vector</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                        {students.map((student) => (
                                            <tr key={student.id} className="group hover:bg-zinc-50/[0.3] dark:hover:bg-zinc-800/30 transition-all">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-14 h-14 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 border border-zinc-50 dark:border-zinc-700 flex items-center justify-center font-black text-primary-main text-lg italic group-hover:bg-primary-main group-hover:text-white transition-all transform group-hover:scale-105 duration-500 shadow-inner">
                                                            {student.name[0]}{student.surname[0]}
                                                        </div>
                                                        <div className="space-y-1.5 min-w-0">
                                                            <p className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight text-lg italic uppercase truncate leading-none">{student.name} {student.surname}</p>
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] leading-none">Admission ID: {student.gr_no}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center justify-end gap-5">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'P')}
                                                            className={cn(
                                                                "flex items-center gap-3 px-8 py-3.5 rounded-radius-medium text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-sm active:scale-95 italic",
                                                                attendance[student.id] === 'P'
                                                                    ? 'bg-primary-main text-white shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5'
                                                                    : 'bg-surface-ground dark:bg-zinc-900 text-zinc-400 hover:text-primary-main hover:bg-primary-main/5 border border-zinc-100 dark:border-zinc-800'
                                                            )}
                                                        >
                                                            <CheckCircle2 className="w-4.5 h-4.5" />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'A')}
                                                            className={cn(
                                                                "flex items-center gap-3 px-8 py-3.5 rounded-radius-medium text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-sm active:scale-95 italic",
                                                                attendance[student.id] === 'A'
                                                                    ? 'bg-error text-white shadow-2xl shadow-error/20 ring-4 ring-error/5'
                                                                    : 'bg-surface-ground dark:bg-zinc-900 text-zinc-400 hover:text-error hover:bg-error/5 border border-zinc-100 dark:border-zinc-800'
                                                            )}
                                                        >
                                                            <XCircle className="w-4.5 h-4.5" />
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end pt-10">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || checkIsInvalidDate(date).invalid}
                                className="px-12 py-6 bg-primary-main text-white rounded-radius-medium text-[11px] font-black uppercase tracking-[0.5em] hover:bg-primary-dark shadow-2xl shadow-primary-main/30 active:scale-95 transition-all flex items-center gap-5 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group italic ring-4 ring-primary-main/5"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
                                        Commit Registry State
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
