'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    User,
    Clock,
    Search,
    Download
} from 'lucide-react';
import { api } from '@/lib/api';

interface TimetableRecord {
    id: number;
    day_of_week: string;
    period_number: number;
    subject: { id: number; name: string };
    teacher: { id: number; name: string };
}

interface ClassData {
    id: number;
    standard: string;
    division: string;
}

export default function TimetablePage() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [timetable, setTimetable] = useState<TimetableRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const PERIODS = [1, 2, 3, 4, 5, 6];

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchTimetable(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const data = await api.getClasses({ limit: 100 });


            setClasses(data.items || []);
            if (data.items?.length > 0) {
                setSelectedClassId(data.items[0].id);
            }
        } catch (error) {
            console.log("error", error);

            console.error('Failed to fetch classes', error);
        }
    };

    const fetchTimetable = async (classId: number) => {
        setLoading(true);
        try {
            const data = await api.getTimetable(classId);
            setTimetable(data.schedule || []);
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    const getSlotData = (day: string, period: number) => {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">School Timetable</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">View and manage periodic schedules for all classes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative group">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                        Select Class
                    </label>
                    <div className="relative">
                        <select
                            value={selectedClassId || ''}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>
                                    Standard {c.standard} - {c.division}
                                </option>
                            ))}
                        </select>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl transition-all shadow-xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-6 text-left border-b border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[120px] sticky left-0 z-20">
                                    <div className="flex items-center gap-2 text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">
                                        <Clock className="w-3.5 h-3.5" />
                                        Periods
                                    </div>
                                </th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-6 text-center border-b border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 min-w-[180px]">
                                        <div className="text-zinc-600 dark:text-zinc-300 font-bold text-sm tracking-wide">
                                            {day}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {PERIODS.map(period => (
                                <tr key={period} className="group hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="p-6 border-b border-r border-zinc-200 dark:border-zinc-800 text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-[2px_0_5px_rgba(0,0,0,0.05)] sticky left-0 z-20">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-bold text-zinc-900 dark:text-white">#{period}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium">Slot</span>
                                        </div>
                                    </td>
                                    {DAYS.map(day => {
                                        const slot = getSlotData(day, period);
                                        console.log("slot", slot);

                                        return (
                                            <td key={`${day}-${period}`} className="p-3 border-b border-r border-zinc-200 dark:border-zinc-800 group/cell overflow-hidden">
                                                {loading ? (
                                                    <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                                                ) : slot ? (
                                                    <div className="relative h-24 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover/cell:scale-[1.02] group-hover/cell:shadow-md group-hover/cell:bg-indigo-500/5 dark:group-hover/cell:bg-indigo-500/10 group-hover/cell:border-indigo-500/20 flex flex-col justify-center gap-2">
                                                        <div className="flex items-center gap-2 group-hover/cell:translate-x-1 transition-transform">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                                                                    {slot.subject?.name}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium tracking-wide">
                                                                    <User className="w-2.5 h-2.5" />
                                                                    <span className="truncate max-w-[120px]">{slot.teacher?.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Activity Indicator */}
                                                        <div className="absolute top-2 right-2 flex gap-0.5">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-20" />
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-20" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center group-hover/cell:border-zinc-200 dark:group-hover/cell:border-zinc-700 transition-colors">
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

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Total periods</p>
                    <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">36</p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-500/5 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Working Days</p>
                    <p className="text-4xl font-black text-zinc-900 dark:text-white">6</p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-500/5 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Max capacity</p>
                    <p className="text-4xl font-black text-zinc-900 dark:text-white">100%</p>
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
