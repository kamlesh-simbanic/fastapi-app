'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    User,
    Clock,
    Search,
    Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGlobalData } from '@/context/GlobalContext';

export default function TimetablePage() {
    const { classes, timetables, loading: globalLoading, refreshTimetable } = useGlobalData();
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

    const activeClassId = selectedClassId || (classes.length > 0 ? classes[0].id : null);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const PERIODS = [1, 2, 3, 4, 5, 6];

    useEffect(() => {
        if (activeClassId && !timetables[activeClassId]) {
            refreshTimetable(activeClassId);
        }
    }, [activeClassId, timetables, refreshTimetable]);

    const timetable = activeClassId ? timetables[activeClassId] || [] : [];
    const loading = globalLoading.timetables;

    const getSlotData = (day: string, period: number) => {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');
        const activeClass = classes.find(c => c.id === activeClassId);
        const className = activeClass ? `Standard ${activeClass.standard} - ${activeClass.division}` : 'Class';

        // Add title
        doc.setFontSize(22);
        doc.setTextColor(30, 30, 30);
        doc.text(`School Timetable - ${className}`, 14, 20);

        // Prepare table data
        const head = [['Slot', ...DAYS]];
        const body = PERIODS.map(period => [
            `#${period}`,
            ...DAYS.map(day => {
                const slot = getSlotData(day, period);
                if (!slot) return '-';
                return `${slot.subject?.name}\n(${slot.teacher?.name || 'TBA'})`;
            })
        ]);

        autoTable(doc, {
            startY: 30,
            head,
            body,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'normal'
            },
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            columnStyles: {
                0: { fontStyle: 'bold', fillColor: [243, 244, 246] }
            },
            alternateRowStyles: {
                fillColor: [252, 253, 255]
            },
            margin: { top: 30 }
        });

        doc.save(`Timetable_${className.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">School Timetable</h1>
                    <p className="text-muted-foreground">View and manage periodic schedules for all classes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToPDF}
                        disabled={loading || timetable.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-muted-foreground dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative group">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Select Class
                    </label>
                    <div className="relative">
                        <select
                            value={activeClassId || ''}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>
                                    Standard {c.standard} - {c.division}
                                </option>
                            ))}
                        </select>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl transition-all shadow-xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-6 text-left border-b border-r border-border bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[120px] sticky left-0 z-20">
                                    <div className="flex items-center gap-2 text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
                                        <Clock className="w-3.5 h-3.5" />
                                        Periods
                                    </div>
                                </th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-6 text-center border-b border-r border-border bg-white/50 dark:bg-zinc-900/50 min-w-[180px]">
                                        <div className="text-muted-foreground dark:text-zinc-300 font-bold text-sm tracking-wide">
                                            {day}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {PERIODS.map(period => (
                                <tr key={period} className="group hover:bg-secondary/50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-6 border-b border-r border-border text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-[2px_0_5px_rgba(0,0,0,0.05)] sticky left-0 z-20">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-bold text-foreground">#{period}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">Slot</span>
                                        </div>
                                    </td>
                                    {DAYS.map(day => {
                                        const slot = getSlotData(day, period);

                                        return (
                                            <td key={`${day}-${period}`} className="p-3 border-b border-r border-border group/cell overflow-hidden">
                                                {loading ? (
                                                    <div className="h-24 rounded-2xl bg-secondary/80 dark:bg-zinc-800 animate-pulse" />
                                                ) : slot ? (
                                                    <div className="relative h-24 p-4 rounded-2xl bg-card border border-zinc-100 dark:border-border shadow-sm transition-all duration-300 group-hover/cell:scale-[1.02] group-hover/cell:shadow-md group-hover/cell:bg-primary/5 dark:group-hover/cell:bg-primary/10 group-hover/cell:border-primary/20 flex flex-col justify-center gap-2">
                                                        <div className="flex items-center gap-2 group-hover/cell:translate-x-1 transition-transform">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <BookOpen className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                                                                    {slot.subject?.name}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-[10px] text-primary font-medium tracking-wide">
                                                                    <User className="w-2.5 h-2.5" />
                                                                    <span className="truncate max-w-[120px]">{slot.teacher?.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Activity Indicator */}
                                                        <div className="absolute top-2 right-2 flex gap-0.5">
                                                            <div className="w-1 h-1 rounded-full bg-primary opacity-20" />
                                                            <div className="w-1 h-1 rounded-full bg-primary opacity-20" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-border/50 flex items-center justify-center group-hover/cell:border-border dark:group-hover/cell:border-zinc-700 transition-colors">
                                                        <span className="text-[10px] font-semibold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Free Slot</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
