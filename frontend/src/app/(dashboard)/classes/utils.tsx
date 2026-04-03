import React from 'react';
import { Column } from '@/components/Table';
import { SchoolClass } from './types';
import { User, Edit2, Trash2 } from 'lucide-react';

interface ClassActionProps {
    onEdit: (cls: SchoolClass) => void;
    onDelete: (id: number) => void;
}

export const getClassColumns = ({
    onEdit,
    onDelete
}: ClassActionProps): Column<SchoolClass>[] => [
        {
            key: 'standard',
            label: 'Standard / Level',
            className: 'text-sm font-black text-zinc-900 dark:text-white tracking-tight italic uppercase'
        },
        {
            key: 'division',
            label: 'Division',
            render: (cls) => (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-[10px]">
                    {cls.division}
                </div>
            )
        },
        {
            key: 'class_teacher',
            label: 'Class Teacher',
            render: (cls) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {cls.class_teacher?.name || 'Not assigned'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (cls) => (
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(cls)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all active:scale-95 font-bold"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(cls.id)}
                        className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all active:scale-95 font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
