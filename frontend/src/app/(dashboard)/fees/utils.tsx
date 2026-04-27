import React from 'react';
import { Column } from '@/components/Table';
import { FeePayment } from './types';
import { Eye } from 'lucide-react';

interface FeeActionProps {
    onView: (payment: FeePayment) => void;
}

export const getFeeColumns = ({
    onView
}: FeeActionProps): Column<FeePayment>[] => [
        {
            key: 'student',
            label: 'Student',
            render: (payment) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground leading-tight">
                        {payment.student?.name} {payment.student?.surname}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        GR: {payment.gr_no}
                    </span>
                </div>
            )
        },
        {
            key: 'term',
            label: 'Term/Year',
            render: (payment) => (
                <span className="text-xs font-bold text-muted-foreground dark:text-zinc-300 uppercase">
                    {payment.term} - {payment.year}
                </span>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (payment) => (
                <span className="text-sm font-black text-success dark:text-success">
                    ${payment.amount.toLocaleString()}
                </span>
            )
        },
        {
            key: 'payment_method',
            label: 'Method',
            sortable: true,
            render: (payment) => (
                <span className="text-[10px] font-black bg-secondary px-2 py-1 rounded uppercase tracking-widest">
                    {payment.payment_method}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            sortable: true,
            render: (payment) => (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(payment.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            className: 'text-right',
            render: (payment) => (
                <button
                    onClick={() => onView(payment)}
                    className="p-2.5 text-muted-foreground hover:text-success hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        }
    ];
