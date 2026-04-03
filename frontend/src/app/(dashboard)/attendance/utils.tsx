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

interface AttendanceReportProps {
    daysArray: number[];
}

export interface AttendanceSummary {
    student_id: number;
    name: string;
    surname: string;
    gr_no: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
    data: Record<string, string>;
}

export interface AttendanceSummaryWithId extends AttendanceSummary {
    id: number;
}

export const getAttendanceReportColumns = ({
    daysArray
}: AttendanceReportProps): Column<AttendanceSummaryWithId>[] => [
        {
            key: 'gr_no',
            label: 'GR No',
            className: 'sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-950/50 z-10 border-r border-zinc-200/50 dark:border-zinc-800/50 w-[100px] min-w-[100px] max-w-[100px] px-6 py-5 transition-colors',
            render: (student) => (
                <span className="font-mono text-xs font-black text-indigo-500">{student.gr_no}</span>
            )
        },
        {
            key: 'student',
            label: 'Student',
            className: 'sticky left-[100px] bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-950/50 z-10 border-r border-zinc-200/50 dark:border-zinc-800/50 w-[200px] min-w-[200px] max-w-[200px] left-[100px] px-6 py-5 transition-colors',
            render: (student) => (
                <p className="text-sm font-black text-zinc-900 dark:text-white italic uppercase tracking-tight truncate max-w-[150px]">
                    {student.name} {student.surname}
                </p>
            )
        },
        ...daysArray.map(day => ({
            key: `day_${day}`,
            label: day.toString(),
            className: 'text-center border-r border-zinc-100 dark:border-zinc-800/30 font-mono text-[10px] px-2 py-5',
            render: (student: AttendanceSummaryWithId) => {
                const status = student.data[day.toString()];
                if (status === 'present') {
                    return <span className="font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">P</span>;
                }
                if (status === 'absent') {
                    return <span className="font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">A</span>;
                }
                return <span className="text-zinc-300 dark:text-zinc-700">-</span>;
            }
        })),
        {
            key: 'stats',
            label: 'Days (P/T)',
            className: 'sticky right-[120px] bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-950/50 z-10 border-l border-zinc-200 dark:border-zinc-800 w-[120px] min-w-[120px] max-w-[120px] px-6 py-5 text-center transition-colors',
            render: (student) => (
                <span className="text-xs font-bold text-zinc-500">
                    {student.present_days} / {student.total_days}
                </span>
            )
        },
        {
            key: 'attendance_percentage',
            label: 'Attendance %',
            className: 'sticky right-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-950/50 z-10 border-l border-zinc-200/50 dark:border-zinc-800/50 w-[120px] min-w-[120px] max-w-[120px] px-6 py-5 text-right transition-colors',
            render: (student) => (
                <span className={`text-sm font-black ${student.attendance_percentage >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {student.attendance_percentage.toFixed(1)}%
                </span>
            )
        }
    ];
