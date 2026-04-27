import React from 'react';
import { Column } from '@/components/Table';
import { Holiday } from './types';
import { CalendarDays, Clock, Trash2 } from 'lucide-react';

interface HolidayActionProps {
    onDelete: (id: number) => void;
}

export const getHolidayColumns = ({
    onDelete
}: HolidayActionProps): Column<Holiday>[] => [
        {
            key: 'name',
            label: 'Holiday Name',
            className: 'text-sm font-bold text-foreground uppercase tracking-tight',
            render: (h) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <span>{h.name}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (h) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'number_of_days',
            label: 'Duration',
            sortable: true,
            render: (h) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    {h.number_of_days} Day{h.number_of_days > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (h) => (
                <button
                    onClick={() => onDelete(h.id)}
                    className="p-2 text-zinc-300 hover:text-destructive transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )
        }
    ];
