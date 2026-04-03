'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Holiday {
    id: number;
    name: string;
    date: string;
    number_of_days: number;
}

interface CalendarPickerProps {
    value?: string; // YYYY-MM-DD
    onChange: (date: string, isHoliday?: boolean) => void;
    placeholder?: string;
    label?: string;
    maxDate?: string;
    minDate?: string;
    shouldDisableDate?: (date: Date) => boolean;
    isHolidayDate?: (date: Date) => boolean;
    disableHolidays?: boolean;
    className?: string;
    error?: string;
}

const CalendarPicker = ({
    value,
    onChange,
    placeholder = 'Select Date',
    label,
    maxDate,
    minDate,
    shouldDisableDate,
    isHolidayDate,
    disableHolidays = false,
    className = '',
    error
}: CalendarPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch holidays if enabled
    useEffect(() => {
        const fetchHolidays = async () => {
            if (!disableHolidays) return;
            try {
                const data = await api.getHolidays({ limit: 100 });
                setHolidays(data || []);
            } catch (err) {
                console.error('Failed to load holidays in CalendarPicker:', err);
            }
        };
        fetchHolidays();
    }, [disableHolidays]);

    // Initial value sets the month view
    useEffect(() => {
        if (value) {
            setCurrentMonth(new Date(value));
        }
    }, [value]);

    // Handle outside clicks to close the calendar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getHolidayInfo = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayFormatted = String(d.getDate()).padStart(2, '0');
        const dStr = `${year}-${month}-${dayFormatted}`;

        return holidays.find(h => {
            if (h.date === dStr) return true;
            if (h.number_of_days > 1) {
                const startDate = new Date(h.date);
                for (let i = 1; i < h.number_of_days; i++) {
                    const nextDate = new Date(startDate);
                    nextDate.setDate(startDate.getDate() + i);
                    const y = nextDate.getFullYear();
                    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
                    const day = String(nextDate.getDate()).padStart(2, '0');
                    if (`${y}-${m}-${day}` === dStr) return true;
                }
            }
            return false;
        });
    };

    const handleDateSelect = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (shouldDisableDate && shouldDisableDate(selected)) return;

        const holiday = (disableHolidays ? getHolidayInfo(selected) : null);
        const isHoliday = !!holiday || (isHolidayDate ? isHolidayDate(selected) : false);

        // Format as YYYY-MM-DD (Local Time)
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const dayFormatted = String(selected.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${dayFormatted}`;

        onChange(formattedDate, isHoliday);
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 80 + i);

    const handleYearChange = (year: number) => {
        setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    };

    const handleMonthChange = (month: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    };


    return (
        <div className={`space-y-2 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-left flex items-center justify-between group ${isOpen ? 'ring-4 ring-blue-600/10 border-blue-600' : ''}`}
            >
                <span className={value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}>
                    {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
                </span>
                <CalendarIcon className={`w-4 h-4 transition-transform ${isOpen ? 'scale-110 text-blue-600' : 'text-zinc-400 group-hover:text-blue-600'}`} />
            </button>

            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-3 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 min-w-[280px] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer hover:text-blue-600 transition-colors appearance-none"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-sans">{m}</option>
                                ))}
                            </select>
                            <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-zinc-400 outline-none cursor-pointer hover:text-blue-600 transition-colors appearance-none"
                            >
                                {years.map(y => (
                                    <option key={y} value={y} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-sans">{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {weekDays.map(day => (
                            <div key={day} className="text-[9px] font-bold uppercase text-zinc-400 text-center tracking-widest">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {(() => {
                            const year = currentMonth.getFullYear();
                            const month = currentMonth.getMonth();
                            const totalDays = new Date(year, month + 1, 0).getDate();
                            const startDay = new Date(year, month, 1).getDay();

                            const days = [];
                            for (let i = 0; i < startDay; i++) {
                                days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
                            }

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = value ? new Date(value) : null;
                            if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

                            for (let d = 1; d <= totalDays; d++) {
                                const dateObj = new Date(year, month, d);
                                const isToday = dateObj.getTime() === today.getTime();
                                const isSelected = selectedDate && dateObj.getTime() === selectedDate.getTime();
                                const isDisabled = shouldDisableDate ? shouldDisableDate(dateObj) : false;
                                const isOutsideRange = !!((maxDate && dateObj > new Date(maxDate)) ||
                                    (minDate && dateObj < new Date(minDate)));

                                const holidayInfo = disableHolidays ? getHolidayInfo(dateObj) : null;
                                const isHoliday = !!holidayInfo || (isHolidayDate ? isHolidayDate(dateObj) : false);

                                days.push(
                                    <div key={d} className="relative group/day flex items-center justify-center">
                                        <button
                                            type="button"
                                            disabled={isDisabled || isOutsideRange || isHoliday}
                                            onClick={() => handleDateSelect(d)}
                                            className={`h-9 w-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                : isHoliday
                                                    ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500/20'
                                                    : isToday
                                                        ? 'text-blue-600 bg-blue-600/10'
                                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                } ${isDisabled || isOutsideRange || isHoliday ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                                        >
                                            {d}
                                        </button>
                                        {isHoliday && holidayInfo && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/day:opacity-100 transition-all z-20 scale-90 group-hover/day:scale-100 shadow-xl tracking-wider uppercase">
                                                {holidayInfo.name}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-100" />
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return days;
                        })()}
                    </div>

                </div>
            )}
        </div>
    );
};

export default CalendarPicker;
