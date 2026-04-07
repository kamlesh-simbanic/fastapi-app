import React from 'react';
import { Column } from '@/components/Table';
import { LeaveRequest } from './types';
import {
    Calendar as CalendarIcon,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared status icon helper
export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
        default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
};

// Columns for Personal Leave History
export const getPersonalLeaveColumns = (): Column<LeaveRequest>[] => [
    {
        key: 'leave_type',
        label: 'Type & Dates',
        render: (req) => (
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                    <p className="font-black text-zinc-900 dark:text-white capitalize italic tracking-tight">{req.leave_type} Leave</p>
                    <p className="text-[10px] font-black text-zinc-400 flex items-center gap-1 uppercase tracking-wide">
                        {new Date(req.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        <ChevronRight className="w-2 h-2" />
                        {new Date(req.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>
        )
    },
    {
        key: 'reason',
        label: 'Reason',
        render: (req) => (
            <p className="text-sm text-zinc-500 font-medium italic border-l-4 border-zinc-100 dark:border-zinc-800 pl-4 py-1 line-clamp-2">
                &quot;{req.reason}&quot;
            </p>
        )
    },
    {
        key: 'status',
        label: 'Status',
        className: 'text-right',
        render: (req) => (
            <div className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                req.status === 'approved' ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20" :
                    req.status === 'rejected' ? "bg-red-500/10 text-red-600 ring-1 ring-red-500/20" :
                        "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
            )}>
                {getStatusIcon(req.status)}
                {req.status}
            </div>
        )
    }
];

// Columns for Leave Approvals (Admin/Manager view)
interface ApprovalActionProps {
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    loadingId: number | null;
}

export const getApprovalLeaveColumns = ({
    onApprove,
    onReject,
    loadingId
}: ApprovalActionProps): Column<LeaveRequest>[] => [
        {
            key: 'staff',
            label: 'Staff Member',
            render: (req) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                        <p className="font-black text-lg italic tracking-tight leading-none mb-1.5">{req.staff?.name}</p>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 rounded text-[9px] font-black uppercase tracking-widest text-zinc-400">{req.staff?.department}</span>
                            <span className="text-[9px] font-black text-zinc-400 uppercase italic">ID: {req.staff_id}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'details',
            label: 'Leave Details',
            render: (req) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{req.leave_type}</span>
                        <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1 opacity-70"><CalendarIcon className="w-3 h-3" /> {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-zinc-500 italic line-clamp-1">&quot;{req.reason}&quot;</p>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (req) => (
                req.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            disabled={loadingId === req.id}
                            onClick={() => onApprove(req.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {loadingId === req.id ? '...' : 'Approve'}
                        </button>
                        <button
                            disabled={loadingId === req.id}
                            onClick={() => onReject(req.id)}
                            className="bg-white dark:bg-zinc-900 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loadingId === req.id ? '...' : 'Reject'}
                        </button>
                    </div>
                ) : (
                    <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        req.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {req.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {req.status}
                    </div>
                )
            )
        }
    ];
