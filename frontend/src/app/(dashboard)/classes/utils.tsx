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
            className: 'text-sm font-black text-foreground tracking-tight italic uppercase',
            render: (cls) => `${cls.standard} - ${cls.division}`
        },
        {
            key: 'class_teacher',
            label: 'Class Teacher',
            render: (cls) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-bold text-foreground">
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
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        title="View Assigned Students"
                    >
                        <Users className="w-3 h-3" />
                        Students
                    </button>
                    <button
                        onClick={() => onEdit(cls)}
                        className="p-2 bg-secondary text-muted-foreground dark:text-muted-foreground rounded-xl hover:bg-secondary/80 transition-all active:scale-95 font-bold"
                        title="Edit Class"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(cls.id)}
                        className="p-2 bg-destructive dark:bg-destructive/10 text-destructive dark:text-destructive rounded-xl hover:bg-destructive transition-all active:scale-95 font-bold"
                        title="Delete Class"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
