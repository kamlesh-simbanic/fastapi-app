import React from 'react';
import { Column } from '@/components/Table';
import { Student } from './types';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export const STUDENT_COLUMNS: Column<Student>[] = [
    {
        key: 'gr_no',
        label: 'GR No',
        sortable: true,
        render: (member) => (
            <span className="bg-secondary text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded text-[10px] font-black font-mono tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                {member.gr_no}
            </span>
        )
    },
    {
        key: 'name',
        label: 'Student Name',
        sortable: true,
        render: (member) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                    {member.name} {member.surname}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">S/O {member.father_name}</span>
            </div>
        )
    },
    {
        key: 'dob',
        label: 'Birth Date',
        sortable: true,
        render: (member) => (
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {new Date(member.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
        )
    },
    {
        key: 'mobile',
        label: 'Contact',
        className: 'text-xs font-bold text-muted-foreground dark:text-zinc-300'
    },
    {
        key: 'city',
        label: 'City',
        sortable: true,
        className: 'text-xs font-bold text-muted-foreground uppercase tracking-wider'
    },
    {
        key: 'actions',
        label: '',
        className: 'text-right',
        render: (member) => (
            <div className="flex items-center justify-end gap-2">
                <Link href={`/students/edit?id=${member.id}`} className="p-2.5 text-muted-foreground hover:text-primary hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
                    <Pencil className="w-4 h-4" />
                </Link>
            </div>
        )
    }
];
