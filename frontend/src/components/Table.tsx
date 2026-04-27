'use client';

import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;

    // Pagination
    page?: number;
    pageSize?: number;
    totalCount?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];

    // Sorting
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (key: string) => void;

    className?: string;
}

const Table = <T extends { id: string | number }>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No records found',
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    sortBy,
    sortOrder,
    onSort,
    className
}: TableProps<T>) => {
    const totalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 0;

    return (
        <div className={cn("space-y-6", className)}>
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-muted/50">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && onSort && onSort(col.key)}
                                        className={cn(
                                            "px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-border/50",
                                            col.sortable && "cursor-pointer hover:text-primary",
                                            col.className
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.label}
                                            {col.sortable && (
                                                sortBy === col.key ? (
                                                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                                                ) : <ArrowUpDown className="w-3 h-3 opacity-30" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="font-medium text-xs">Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-8 py-20 text-center">
                                        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.key} className={cn("px-8 py-6", col.className)}>
                                                {col.render ? col.render(item) : (
                                                    <span className="text-sm font-bold text-foreground/80 italic">
                                                        {String((item as Record<string, unknown>)[col.key] ?? '')}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            {(totalPages > 0 || (pageSizeOptions && onPageSizeChange)) && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
                    <div className="flex items-center gap-10">
                        {onPageSizeChange && pageSize && (
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rows per page</span>
                                <div className="relative group">
                                    <select
                                        value={pageSize}
                                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                        className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-[10px] font-bold text-foreground uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer shadow-sm"
                                    >
                                        {pageSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        )}
                        {totalCount !== undefined && (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Total Records: <span className="text-primary ml-1">{totalCount}</span>
                            </p>
                        )}
                    </div>

                    {onPageChange && page && totalPages > 1 && (
                        <div className="flex items-center gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => onPageChange(page - 1)}
                                className="p-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const maxPages = 5;
                                    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
                                    let endPage = startPage + maxPages - 1;

                                    if (endPage > totalPages) {
                                        endPage = totalPages;
                                        startPage = Math.max(1, endPage - maxPages + 1);
                                    }

                                    const pages = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        if (i >= 1) pages.push(i);
                                    }

                                    return pages.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => onPageChange(p)}
                                            className={cn(
                                                "w-10 h-10 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm",
                                                page === p
                                                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-4 ring-primary/5 active:scale-95"
                                                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                                            )}
                                        >
                                            {p.toString().padStart(2, '0')}
                                        </button>
                                    ));
                                })()}
                            </div>
                            <button
                                disabled={page === totalPages}
                                onClick={() => onPageChange(page + 1)}
                                className="p-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

    );
};

export default Table;
