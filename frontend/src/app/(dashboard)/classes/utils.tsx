import React from 'react';
import { Column } from '@/components/Table';
import { SchoolClass } from './types';
import { User, Edit2, Trash2, Users } from 'lucide-react';

interface ClassActionProps {
    onEdit: (cls: SchoolClass) => void;
    onDelete: (id: number) => void;
    onViewStudents: (cls: SchoolClass) => void;
}

export const getClassColumns = ({
    onEdit,
    onDelete,
    onViewStudents
}: ClassActionProps): Column<SchoolClass>[] => [
        {
            key: 'class_title',
            label: 'Class Title',
            className: 'text-sm font-black text-zinc-900 dark:text-white tracking-tight italic uppercase',
            render: (cls) => `${cls.standard} - ${cls.division}`
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
                        onClick={() => onViewStudents(cls)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                        title="View Assigned Students"
                    >
                        <Users className="w-3 h-3" />
                        Students
                    </button>
                    <button
                        onClick={() => onEdit(cls)}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 font-bold"
                        title="Edit Class"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(cls.id)}
                        className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition-all active:scale-95 font-bold"
                        title="Delete Class"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
