'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    ChevronDown,
    AlertCircle,
    ClipboardCheck,
    FileText
} from 'lucide-react';
import Link from 'next/link';

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

    useEffect(() => {
        const loadPageData = async () => {
            if (selectedClass) {
                await fetchStudents(selectedClass);
                await fetchAttendance(selectedClass, date);
            }
        };
        loadPageData();
    }, [selectedClass, date, fetchStudents, fetchAttendance]);

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
            setError('Please select a class.');
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
            setSuccess('Attendance recorded successfully!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to submit attendance.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-space">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        Mark Attendance
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Record daily student attendance by class.</p>
                </div>

                <Link
                    href="/attendance/report"
                    className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 group"
                >
                    <FileText className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    Monthly Report
                </Link>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{success}</p>
                </div>
            )}

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> Select Class
                    </label>
                    <div className="relative">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={classesLoading}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
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

            {/* Student List */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in duration-500">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Loading student roster...</p>
                    </div>
                ) : students.length === 0 ? (
                    selectedClass ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            <Users className="w-12 h-12 text-zinc-300" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No students found</h3>
                            <p className="text-zinc-500 text-sm max-w-xs">There are no students mapped to this class yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-700">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/5 flex items-center justify-center">
                                <Users className="w-10 h-10 text-emerald-500/40" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Ready to start?</h3>
                                <p className="text-zinc-500 text-sm max-w-sm mx-auto">Select a class from the dropdown above to load the student list and mark attendance.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Student Roster ({students.length})</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAll(true)}
                                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                >
                                    Mark All Present
                                </button>
                                <span className="text-zinc-300">•</span>
                                <button
                                    onClick={() => toggleAll(false)}
                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Student</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Attendance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {students.map((student) => (
                                        <tr key={student.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-xs">
                                                        {student.name[0]}{student.surname[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 italic">{student.name} {student.surname}</p>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GR No: {student.gr_no}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'P')}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${attendance[student.id] === 'P'
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        <CheckCircle2 className={`w-4 h-4 ${attendance[student.id] === 'P' ? 'text-white' : 'text-zinc-400'}`} />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'A')}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${attendance[student.id] === 'A'
                                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        <XCircle className={`w-4 h-4 ${attendance[student.id] === 'A' ? 'text-white' : 'text-zinc-400'}`} />
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Submit Attendance
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
