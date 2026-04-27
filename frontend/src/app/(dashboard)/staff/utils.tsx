import React from 'react';
import { Column } from '@/components/Table';
import { Staff } from './types';
import { cn } from '@/lib/utils';
import { getDepartmentColor } from '@/lib/departments';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export const STAFF_COLUMNS: Column<Staff>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        className: 'font-bold text-foreground text-sm'
    },
    {
        key: 'department',
        label: 'Department',
        render: (member) => (
            <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", getDepartmentColor(member.department))}>
                {member.department}
            </span>
        )
    },
    {
        key: 'qualification',
        label: 'Degree',
        sortable: true,
        className: 'text-xs font-medium text-muted-foreground'
    },
    {
        key: 'contact',
        label: 'Contact Info',
        render: (member) => (
            <div className="text-[11px] text-muted-foreground">
                <div className="text-muted-foreground dark:text-zinc-300 font-medium">{member.email}</div>
                <div>{member.mobile}</div>
            </div>
        )
    },
    {
        key: 'city',
        label: 'City',
        sortable: true,
        className: 'text-xs text-muted-foreground'
    },
    {
        key: 'created_at',
        label: 'Joined',
        sortable: true,
        render: (member) => (
            <span className="text-xs text-muted-foreground">
                {new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
        )
    },
    {
        key: 'actions',
        label: '',
        className: 'text-right',
        render: (member) => (
            <div className="flex items-center justify-end gap-1">
                <Link href={`/staff/edit?id=${member.id}`} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary dark:hover:bg-primary/10 rounded-xl transition-all shadow-sm group">
                    <Pencil className="w-4 h-4 transition-transform group-hover:scale-110" />
                </Link>
            </div>
        )
    }
];
