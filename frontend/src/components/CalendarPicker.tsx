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

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

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

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];
        // Fill in empty slots for the first week
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
                        className={`h-9 w-9 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${isSelected
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                            : isHoliday
                                ? 'text-accent bg-accent/10 font-extrabold ring-2 ring-accent/20'
                                : isToday
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:bg-muted'
                            } ${isDisabled || isOutsideRange || isHoliday ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                    >
                        {d}
                    </button>
                    {isHoliday && holidayInfo && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-[9px] font-black rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/day:opacity-100 transition-all z-20 scale-90 group-hover/day:scale-100 shadow-xl border border-border tracking-wider uppercase">
                            {holidayInfo.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-foreground" />
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className={`space-y-2 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-left flex items-center justify-between group ${isOpen ? 'ring-4 ring-primary/10 border-primary' : ''}`}
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                    {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
                </span>
                <CalendarIcon className={`w-4 h-4 transition-transform ${isOpen ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
            </button>

            {error && <p className="text-[10px] font-bold text-destructive">{error}</p>}

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-3 z-50 bg-card border border-border rounded-[2rem] shadow-2xl p-6 min-w-[280px] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-black text-foreground italic outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i} className="bg-card text-foreground font-sans not-italic">{m}</option>
                                ))}
                            </select>
                            <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-black text-muted-foreground outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
                            >
                                {years.map(y => (
                                    <option key={y} value={y} className="bg-card text-foreground font-sans not-italic">{y}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {weekDays.map(day => (
                            <div key={day} className="text-[9px] font-black uppercase text-muted/30 text-center">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>

                </div>
            )}
        </div>

    );
};

export default CalendarPicker;
