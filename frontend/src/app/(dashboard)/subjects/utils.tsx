import React from 'react';
import { Column } from '@/components/Table';
import { Subject } from './types';
import { cn } from '@/lib/utils';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';

interface SubjectActionProps {
    selectedSubjectId?: number;
    onViewTeachers: (sub: Subject) => void;
    onEdit: (sub: Subject) => void;
    onDelete: (id: number) => void;
}

export const getSubjectColumns = ({
    selectedSubjectId,
    onViewTeachers,
    onEdit,
    onDelete
}: SubjectActionProps): Column<Subject>[] => [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            className: 'text-[10px] font-mono text-zinc-400 dark:text-zinc-500 w-20'
        },
        {
            key: 'name',
            label: 'Subject Name',
            className: 'text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight'
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (sub) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => onViewTeachers(sub)}
                        className={cn(
                            "p-2 rounded-xl transition-all",
                            selectedSubjectId === sub.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                        )}
                        title="View Teachers"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(sub)}
                        className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-100 transition-all font-bold"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(sub.id)}
                        className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
