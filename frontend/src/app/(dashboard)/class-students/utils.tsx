import React from 'react';
import { Column } from '@/components/Table';
import { ClassStudent } from './types';
import { UserCircle, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ClassStudentActionProps {
    onEdit: (m: ClassStudent) => void;
    onDelete: (id: number) => void;
}

export const getClassStudentColumns = ({
    onEdit,
    onDelete
}: ClassStudentActionProps): Column<ClassStudent>[] => [
        {
            key: 'academic_year',
            label: 'Academic Year',
            sortable: true,
            className: 'text-sm font-bold text-foreground'
        },
        {
            key: 'class',
            label: 'Class',
            render: (m) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                        {m.school_class?.standard}
                    </div>
                    <span className="text-sm font-black text-foreground tracking-tight italic">
                        {m.school_class ? `${m.school_class.standard} - ${m.school_class.division}` : `Class ID: ${m.class_id}`}
                    </span>
                </div>
            )
        },
        {
            key: 'students',
            label: 'Total Students',
            render: (m) => (
                <span className="px-3 py-1 bg-secondary text-muted-foreground dark:text-muted-foreground rounded-full text-[10px] font-black tracking-widest">
                    {m.students.length} STUDENTS
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (m) => (
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href={`/class-students/detail?id=${m.id}`}
                        className="p-2 bg-zinc-50 dark:bg-zinc-800 text-primary hover:text-primary rounded-xl transition-all shadow-sm"
                        title="View Details"
                    >
                        <UserCircle className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onEdit(m)}
                        className="p-2 bg-primary dark:bg-primary/10 text-primary dark:text-primary rounded-xl hover:bg-primary transition-all active:scale-95 font-bold shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(m.id)}
                        className="p-2 bg-destructive dark:bg-destructive/10 text-destructive dark:text-destructive rounded-xl hover:bg-destructive transition-all active:scale-95 font-bold shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
