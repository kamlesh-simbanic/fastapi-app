import React from 'react';
import { Column } from '@/components/Table';
import { FeeStructure } from './types';
import { Edit2, Trash2 } from 'lucide-react';

interface FeeStructureActionProps {
    onEdit: (fee: FeeStructure) => void;
    onDelete: (id: number) => void;
}

export const getFeeStructureColumns = ({
    onEdit,
    onDelete
}: FeeStructureActionProps): Column<FeeStructure>[] => [
        {
            key: 'class',
            label: 'Class',
            className: 'font-black text-zinc-900 dark:text-white capitalize',
            render: (fee) => fee.school_class ? `${fee.school_class.standard} - ${fee.school_class.division}` : 'Unknown Class'
        },
        {
            key: 'year',
            label: 'Academic Year',
            className: 'font-bold text-zinc-600 dark:text-zinc-400',
            render: (fee) => fee.year
        },
        {
            key: 'fee_amount',
            label: 'Fee Amount',
            className: 'font-black text-emerald-600 dark:text-emerald-400 text-lg',
            render: (fee) => `$${fee.fee_amount.toLocaleString()}`
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right',
            render: (fee) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(fee)} className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(fee.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
