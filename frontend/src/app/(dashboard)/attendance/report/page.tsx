'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
    Calendar,
    Loader2,
    FileText,
    ChevronDown,
    ChevronLeft,
    Search,
    Download,
    TrendingUp,
    TrendingDown,
    Activity,
    Users2,
    AlertCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Table from '@/components/Table';
import { getAttendanceReportColumns, AttendanceSummary, AttendanceSummaryWithId } from '../utils';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

function AttendanceReportContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>(searchParams.get('class_id') || '');
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [report, setReport] = useState<AttendanceSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const fetchReport = useCallback(async () => {
        if (!selectedClass) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.getMonthlyReport({
                class_id: parseInt(selectedClass),
                month,
                year
            });
            setReport(data);
        } catch {
            setError('Failed to load attendance report.');
        } finally {
            setLoading(false);
        }
    }, [selectedClass, month, year]);

    useEffect(() => {
        if (user) {
            fetchClasses();
        }
    }, [fetchClasses, user]);

    useEffect(() => {
        if (user && selectedClass) {
            fetchReport();
        }
    }, [fetchReport, user, selectedClass]);

    if (!user) return null;

    const filteredReport: AttendanceSummaryWithId[] = report
        .filter(s =>
            `${s.name} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.gr_no.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const nameA = `${a.name} ${a.surname}`.toLowerCase();
            const nameB = `${b.name} ${b.surname}`.toLowerCase();
            if (nameB < nameA) return 1;
            if (nameB > nameA) return -1;
            return 0;
        })
        .map(s => ({ ...s, id: s.student_id }));

    const averageAttendance = report.length > 0
        ? report.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / report.length
        : 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const exportToPDF_Frontend = () => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const className = classes.find(c => c.id.toString() === selectedClass);
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        // Header
        doc.setFontSize(22);
        doc.setTextColor(50, 50, 50);
        doc.text('Monthly Attendance Report (FE)', 14, 15);

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(`Class: Standard ${className?.standard} - ${className?.division} | Period: ${monthName} ${year}`, 14, 25);

        // Prepare table data
        const head = [
            ['GR No', 'Student', ...daysArray.map(String), 'P/T', '%']
        ];

        const body = filteredReport.map(student => [
            student.gr_no,
            `${student.name} ${student.surname}`,
            ...daysArray.map(day => {
                const status = student.data[day.toString()];
                if (status === 'present') return 'P';
                if (status === 'absent') return 'A';
                return '-';
            }),
            `${student.present_days}/${student.total_days}`,
            `${student.attendance_percentage.toFixed(1)}%`
        ]);

        autoTable(doc, {
            head,
            body,
            startY: 35,
            theme: 'grid',
            headStyles: {
                fillColor: [80, 80, 80],
                textColor: [255, 255, 255],
                fontSize: 7,
                halign: 'center',
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 6,
                halign: 'center'
            },
            columnStyles: {
                1: { halign: 'left', cellWidth: 35 }, // Student name column
                0: { fontStyle: 'bold', cellWidth: 15 } // GR No
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index >= 2 && data.column.index < daysArray.length + 2) {
                    if (data.cell.text[0] === 'P') {
                        doc.setTextColor(16, 185, 129); // emerald-500
                    } else if (data.cell.text[0] === 'A') {
                        doc.setTextColor(239, 68, 68); // red-500
                    }
                }
            }
        });

        doc.save(`Attendance_Report_FE_${className?.standard}_${className?.division}_${monthName}_${year}.pdf`);
    };

    const exportToPDF_Backend = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const blob = await api.getMonthlyReportPDF({
                class_id: parseInt(selectedClass),
                month,
                year
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const className = classes.find(c => c.id.toString() === selectedClass);
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
            a.download = `Attendance_Report_Server_${className?.standard}_${className?.division}_${monthName}_${year}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download PDF report.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-space">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-500 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Attendance
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Monthly Report
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">Detailed attendance analysis and student statistics.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={exportToPDF_Frontend}
                        disabled={loading || report.length === 0}
                        className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF (Client)
                    </button>
                    <button
                        onClick={exportToPDF_Backend}
                        disabled={loading || report.length === 0}
                        className="flex items-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-zinc-900/10 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : 'hidden'}`} />
                        <Download className={`w-4 h-4 ${loading ? 'hidden' : ''}`} />
                        Export PDF (Server)
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Select Month
                    </label>
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m}>
                                    {new Date(2023, m - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Select Year
                    </label>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                            {[2023, 2024, 2025, 2026].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Users2 className="w-3 h-3" /> Select Class
                    </label>
                    <div className="relative">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={classesLoading}
                            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Select a class...</option>
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

            {/* Statistics Cards */}
            {selectedClass && !loading && report.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Average Attendance</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic">{averageAttendance.toFixed(1)}%</h3>
                            <div className={`mb-1 p-1 rounded-full ${averageAttendance >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {averageAttendance >= 75 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Students</p>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic">{report.length}</h3>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Class</p>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic">
                            {classes.find(c => c.id.toString() === selectedClass)?.standard || 'N/A'}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Academic Year</p>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic">2023-24</h3>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Synthesizing report...</p>
                    </div>
                ) : !selectedClass ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <Search className="w-10 h-10 text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 italic">Select class to view report</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto font-medium">Choose a class, month, and year from the controls above to generate the attendance analysis.</p>
                        </div>
                    </div>
                ) : report.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No data for selected period</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                            <Search className="w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or GR number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-sm font-bold"
                            />
                        </div>

                        <Table
                            columns={getAttendanceReportColumns({ daysArray })}
                            data={filteredReport}
                            loading={loading}
                            emptyMessage="No attendance data found for the selected period."
                            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AttendanceReportPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-bold text-sm tracking-widest uppercase opacity-70">Connecting to streams...</p>
            </div>
        }>
            <AttendanceReportContent />
        </Suspense>
    );
}
