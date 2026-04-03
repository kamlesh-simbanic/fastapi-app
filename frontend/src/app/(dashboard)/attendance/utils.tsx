import React from 'react';
import { Column } from '@/components/Table';
import { Student } from '../students/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AttendanceActionProps {
    attendance: Record<number, string>;
    onStatusChange: (studentId: number, status: string) => void;
}

export const getAttendanceColumns = ({
    attendance,
    onStatusChange
}: AttendanceActionProps): Column<Student>[] => [
        {
            key: 'student',
            label: 'Student',
            render: (student) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-xs">
                        {student.name[0]}{student.surname[0]}
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 italic">{student.name} {student.surname}</p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GR No: {student.gr_no}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Attendance',
            className: 'text-right',
            render: (student) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => onStatusChange(student.id, 'P')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${attendance[student.id] === 'P'
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'
                            }`}
                    >
                        <CheckCircle2 className={`w-4 h-4 ${attendance[student.id] === 'P' ? 'text-white' : 'text-zinc-400'}`} />
                        Present
                    </button>
                    <button
                        onClick={() => onStatusChange(student.id, 'A')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${attendance[student.id] === 'A'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'
                            }`}
                    >
                        <XCircle className={`w-4 h-4 ${attendance[student.id] === 'A' ? 'text-white' : 'text-zinc-400'}`} />
                        Absent
                    </button>
                </div>
            )
        }
    ];
