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
import { cn } from '@/lib/utils';

interface SchoolClass {
    id: number;
    standard: string;
    division: string;
}

interface AttendanceSummary {
    student_id: number;
    name: string;
    surname: string;
    gr_no: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
    data: Record<string, string>;
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

    const filteredReport = report
        .filter(s =>
            `${s.name} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.gr_no.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const nameA = `${a.name} ${a.surname}`.toLowerCase();
            const nameB = `${b.name} ${b.surname}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });

    const averageAttendance = report.length > 0
        ? report.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / report.length
        : 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const exportToPDF_Frontend = () => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const className = classes.find(c => c.id.toString() === selectedClass);
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text('Monthly Attendance Registry', 14, 15);

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Academic Batch: Standard ${className?.standard} - ${className?.division} | Session: ${monthName} ${year}`, 14, 25);

        const head = [
            ['Serial ID', 'Academic Member', ...daysArray.map(String), 'P/T', '%']
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
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontSize: 7,
                halign: 'center',
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 6,
                halign: 'center',
                textColor: [71, 85, 105]
            },
            columnStyles: {
                1: { halign: 'left', cellWidth: 40, fontStyle: 'bold' },
                0: { fontStyle: 'bold', cellWidth: 15 }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index >= 2 && data.column.index < daysArray.length + 2) {
                    if (data.cell.text[0] === 'P') {
                        doc.setTextColor(37, 99, 235);
                    } else if (data.cell.text[0] === 'A') {
                        doc.setTextColor(239, 68, 68);
                    }
                }
            }
        });

        doc.save(`Registry_Analytics_${className?.standard}_${className?.division}_${monthName}_${year}.pdf`);
    };

    const exportToPDF_Backend = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const blob = await api.getMonthlyReportPDF({
                classId: parseInt(selectedClass),
                month,
                year,
                class_id: parseInt(selectedClass)
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const className = classes.find(c => c.id.toString() === selectedClass);
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
            a.download = `Institutional_Archive_Export_${className?.standard}_${className?.division}_${monthName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download institutional PDF archive.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-10 flex-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-primary-main uppercase tracking-[0.4em] transition-all group italic"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                        Return to Registry Input
                    </button>

                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-2xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white flex items-center gap-4 italic tracking-tight uppercase leading-none">
                                    Archive Analytics
                                </h1>
                                <p className="text-primary-main/60 font-black text-[10px] uppercase tracking-[0.3em] italic leading-none">Institutional Insight Stream</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 self-end">
                    <button
                        onClick={exportToPDF_Frontend}
                        disabled={loading || report.length === 0}
                        className="flex items-center gap-3.5 px-8 py-4 bg-surface-paper dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary-main transition-all shadow-sm active:scale-95 disabled:opacity-30 italic ring-1 ring-zinc-50 dark:ring-zinc-800/10"
                    >
                        <Download className="w-4.5 h-4.5" />
                        Client Segment
                    </button>
                    <button
                        onClick={exportToPDF_Backend}
                        disabled={loading || report.length === 0}
                        className="flex items-center gap-3.5 px-8 py-4 bg-primary-main text-white rounded-radius-medium text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary-main/20 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-30 italic ring-4 ring-primary-main/5"
                    >
                        <Download className={cn("w-4.5 h-4.5", loading ? "hidden" : "block")} />
                        <Loader2 className={cn("w-4.5 h-4.5 animate-spin", loading ? "block" : "hidden")} />
                        Detailed Archive
                    </button>
                </div>
            </section>

            {error && (
                <div className="p-6 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center gap-5 text-error animate-in slide-in-from-top-2 shadow-sm font-black uppercase tracking-widest italic text-[11px]">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-surface-paper dark:bg-zinc-900 p-12 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 relative overflow-hidden ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-main/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />

                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-2 ml-1 italic leading-none">
                        <Calendar className="w-4 h-4 text-primary-main" /> Registry Month
                    </label>
                    <div className="relative group">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-zinc-100 cursor-pointer italic uppercase tracking-wider"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m}>
                                    {new Date(2023, m - 1).toLocaleString('default', { month: 'long' }).toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-hover:text-primary-main transition-colors pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-2 ml-1 italic leading-none">
                        <Activity className="w-4 h-4 text-primary-main" /> Evaluation Year
                    </label>
                    <div className="relative group">
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-full appearance-none bg-surface-ground dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-4.5 px-6 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all font-black text-zinc-900 dark:text-zinc-100 cursor-pointer italic uppercase tracking-wider"
                        >
                            {[2024, 2025, 2026].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-hover:text-primary-main transition-colors pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-3 z-10">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-2 ml-1 italic leading-none">
                        <Users2 className="w-4 h-4 text-primary-main" /> Discipline Unit
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

            {/* Statistics Cards */}
            {selectedClass && !loading && report.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-surface-paper dark:bg-zinc-900 p-10 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-primary-main/20 transition-all ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Mean Adherence</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight italic">{averageAttendance.toFixed(1)}%</h3>
                            <div className={cn("w-12 h-12 rounded-radius-medium flex items-center justify-center transition-all shadow-inner", averageAttendance >= 75 ? 'bg-primary-main/5 text-primary-main border border-primary-main/10' : 'bg-amber-500/5 text-amber-500 border border-amber-500/10')}>
                                {averageAttendance >= 75 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-paper dark:bg-zinc-900 p-10 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-primary-main/20 transition-all ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Cohort Magnitude</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight italic">{report.length.toString().padStart(2, '0')}</h3>
                            <div className="w-12 h-12 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 text-zinc-400 group-hover:text-primary-main transition-colors border border-zinc-50 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                                <Users2 className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-paper dark:bg-zinc-900 p-10 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-primary-main/20 transition-all ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Focus Segment</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight italic uppercase">
                                {classes.find(c => c.id.toString() === selectedClass)?.standard || 'N/A'}
                            </h3>
                            <div className="w-12 h-12 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 text-zinc-400 group-hover:text-primary-main transition-colors border border-zinc-50 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-paper dark:bg-zinc-900 p-10 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm group hover:border-primary-main/20 transition-all ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 italic leading-none">Active Cycle</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight italic">24-25</h3>
                            <div className="w-12 h-12 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 text-zinc-400 group-hover:text-primary-main transition-colors border border-zinc-50 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-44 gap-8 text-zinc-500 animate-in fade-in duration-700">
                        <Loader2 className="w-20 h-20 text-primary-main animate-spin" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-[11px] tracking-[0.5em] uppercase opacity-70 italic">Processing Analytical Streams...</p>
                            <p className="text-[10px] font-black text-zinc-400 animate-pulse italic uppercase tracking-widest leading-none">Aggregating Institutional Registry</p>
                        </div>
                    </div>
                ) : !selectedClass ? (
                    <div className="flex flex-col items-center justify-center py-44 gap-10 bg-surface-ground/30 dark:bg-zinc-900/10 rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-700">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-main/10 rounded-full blur-[100px] animate-pulse"></div>
                            <div className="relative w-28 h-28 rounded-radius-large bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                                <Search className="w-14 h-14 text-primary-main opacity-20" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight italic uppercase">Awaiting Parameters</h3>
                            <p className="text-zinc-500 text-[10px] max-w-sm mx-auto font-black italic uppercase tracking-[0.3em] leading-loose opacity-60">Define the target segment and temporal period above to visualize the registry analytics stream.</p>
                        </div>
                    </div>
                ) : report.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8 bg-surface-ground dark:bg-zinc-950/30 rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in scale-in-95">
                        <div className="w-24 h-24 rounded-radius-large bg-surface-paper dark:bg-zinc-800 flex items-center justify-center border border-zinc-50 dark:border-zinc-700 shadow-inner mx-auto">
                            <Activity className="w-12 h-12 text-zinc-200 dark:text-zinc-700" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-zinc-500 font-black italic text-[11px] uppercase tracking-[0.4em] leading-none">Zero Analytics Detected</p>
                            <p className="text-zinc-400 font-medium italic text-[10px] uppercase tracking-widest opacity-60 mt-4 leading-relaxed max-w-xs mx-auto">No registry data available for the selected epoch and unit configuration.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="bg-surface-paper dark:bg-zinc-900 p-8 rounded-radius-large border border-zinc-200 dark:border-zinc-800 shadow-sm relative group overflow-hidden ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-main/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50 transition-transform group-focus-within:scale-[1.5]" />
                            <div className="relative z-10 flex items-center gap-6">
                                <Search className="w-6 h-6 text-zinc-300 group-focus-within:text-primary-main transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Filter registry by member identity or Entry Serial..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-sm font-black text-zinc-900 dark:text-white placeholder:opacity-20 italic uppercase tracking-widest"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                                        <X className="w-4.5 h-4.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm ring-1 ring-zinc-50 dark:ring-zinc-800/10">
                            <div className="overflow-x-auto text-[10px]">
                                <table className="w-full text-left border-separate border-spacing-0 min-w-[1400px]">
                                    <thead className="bg-surface-ground">
                                        <tr>
                                            <th className="px-8 py-6 font-black text-zinc-400 uppercase tracking-[0.4em] sticky left-0 bg-surface-ground z-20 border-b border-zinc-100 dark:border-zinc-800 italic">Serial ID</th>
                                            <th className="px-10 py-6 font-black text-zinc-400 uppercase tracking-[0.4em] sticky left-[120px] bg-surface-ground z-20 border-b border-zinc-100 dark:border-zinc-800 min-w-[280px] italic shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)] border-r border-zinc-100 dark:border-zinc-800">Academic Identity</th>
                                            {daysArray.map(day => (
                                                <th key={day} className="px-2 py-6 font-black text-zinc-400 uppercase tracking-[0.3em] text-center min-w-[45px] border-b border-zinc-100 dark:border-zinc-800 italic border-r border-zinc-50/10 dark:border-zinc-800/10">
                                                    {day.toString().padStart(2, '0')}
                                                </th>
                                            ))}
                                            <th className="px-8 py-6 font-black text-zinc-400 uppercase tracking-[0.3em] text-center border-b border-zinc-100 dark:border-zinc-800 bg-surface-ground sticky right-[130px] z-10 italic shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.05)] border-l border-zinc-100 dark:border-zinc-800 uppercase">Input Vector (P/T)</th>
                                            <th className="px-8 py-6 font-black text-zinc-400 uppercase tracking-[0.3em] text-right bg-surface-ground sticky right-0 z-20 border-b border-zinc-100 dark:border-zinc-800 italic shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.08)] border-l border-zinc-100 dark:border-zinc-800 uppercase">Adherence %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                        {filteredReport.map((student) => (
                                            <tr key={student.student_id} className="group hover:bg-zinc-50/[0.3] dark:hover:bg-zinc-800/30 transition-all text-[11px]">
                                                <td className="px-8 py-7 sticky left-0 bg-white dark:bg-zinc-900 z-10 group-hover:bg-zinc-50/[0.8] dark:group-hover:bg-zinc-800/40 border-r border-zinc-50/50 dark:border-zinc-800/50 text-primary-main font-black italic uppercase tracking-wider">
                                                    {student.gr_no}
                                                </td>
                                                <td className="px-10 py-7 sticky left-[120px] bg-white dark:bg-zinc-900 z-10 group-hover:bg-zinc-50/[0.8] dark:group-hover:bg-zinc-800/40 border-r border-zinc-50 dark:border-zinc-800 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                                    <p className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase truncate leading-none">
                                                        {student.name} {student.surname}
                                                    </p>
                                                </td>
                                                {daysArray.map(day => {
                                                    const status = student.data[day.toString()];
                                                    return (
                                                        <td key={day} className="px-1 py-7 text-center border-r border-zinc-50/30 dark:border-zinc-800/30 last:border-r-0">
                                                            {status === 'present' ? (
                                                                <div className="w-7 h-7 rounded-md bg-primary-main text-white flex items-center justify-center mx-auto text-[9px] font-black shadow-lg shadow-primary-main/20 italic transform group-hover:scale-110 transition-transform">P</div>
                                                            ) : status === 'absent' ? (
                                                                <div className="w-7 h-7 rounded-md bg-error text-white flex items-center justify-center mx-auto text-[9px] font-black shadow-lg shadow-error/20 italic transform group-hover:scale-110 transition-transform">A</div>
                                                            ) : (
                                                                <span className="text-zinc-100 dark:text-zinc-800/30">&ndash;</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-8 py-7 text-center border-l border-zinc-50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/[0.8] dark:group-hover:bg-zinc-800/40 sticky right-[130px] z-10 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] font-black text-zinc-400 italic tabular-nums tracking-widest">
                                                    {student.present_days.toString().padStart(2, '0')} <span className="opacity-20 mx-1">/</span> {student.total_days.toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-8 py-7 text-right bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/[0.8] dark:group-hover:bg-zinc-800/40 sticky right-0 z-20 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)] border-l border-zinc-50 dark:border-zinc-800 backdrop-blur-sm">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className={cn("text-sm font-black tabular-nums tracking-tighter italic", student.attendance_percentage >= 75 ? 'text-primary-main' : 'text-amber-500')}>
                                                            {student.attendance_percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AttendanceReportPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-44 gap-8 text-zinc-500 animate-in fade-in">
                <Loader2 className="w-20 h-20 text-primary-main animate-spin" />
                <div className="text-center space-y-2">
                    <p className="font-black text-[11px] tracking-[0.5em] uppercase opacity-80 italic">Synchronizing Analytics...</p>
                    <p className="text-[10px] font-black text-zinc-400 animate-pulse italic mt-2 uppercase tracking-widest leading-none">Accessing Registry Stream</p>
                </div>
            </div>
        }>
            <AttendanceReportContent />
        </Suspense>
    );
}
