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
            className: 'text-[10px] font-mono text-muted-foreground w-20'
        },
        {
            key: 'name',
            label: 'Subject Name',
            className: 'text-sm font-bold text-foreground uppercase tracking-tight'
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
                            selectedSubjectId === sub.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary dark:bg-primary/10 text-primary dark:text-primary hover:bg-primary"
                        )}
                        title="View Teachers"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(sub)}
                        className="p-2 bg-zinc-50 dark:bg-zinc-800 text-muted-foreground dark:text-muted-foreground rounded-xl hover:bg-secondary transition-all font-bold"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(sub.id)}
                        className="p-2 bg-destructive dark:bg-destructive/10 text-destructive dark:text-destructive rounded-xl hover:bg-destructive transition-all font-bold"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
