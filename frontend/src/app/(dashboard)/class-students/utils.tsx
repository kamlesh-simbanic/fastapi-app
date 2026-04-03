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
            className: 'text-sm font-bold text-zinc-900 dark:text-white'
        },
        {
            key: 'class',
            label: 'Class',
            render: (m) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-[10px]">
                        {m.school_class?.standard}
                    </div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white tracking-tight italic">
                        {m.school_class ? `${m.school_class.standard} - ${m.school_class.division}` : `Class ID: ${m.class_id}`}
                    </span>
                </div>
            )
        },
        {
            key: 'students',
            label: 'Total Students',
            render: (m) => (
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black tracking-widest">
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
                        className="p-2 bg-zinc-50 dark:bg-zinc-800 text-indigo-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                        title="View Details"
                    >
                        <UserCircle className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onEdit(m)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all active:scale-95 font-bold shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(m.id)}
                        className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all active:scale-95 font-bold shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
