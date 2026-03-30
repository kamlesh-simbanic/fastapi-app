'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import {
    CreditCard,
    Search,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ChevronDown,
    X,
    Eye,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface FeePayment {
    id: number;
    gr_no: string;
    student_id: number;
    term: string;
    year: number;
    amount: number;
    payment_method: string;
    payment_details?: string;
    created_at: string;
    student?: {
        name: string;
        surname: string;
        father_name: string;
    };
}

const PAGE_SIZE_OPTIONS = [6, 12, 24, 50];

export default function FeesPage() {
    const { user } = useAuth();

    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(12);
    const [term, setTerm] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [error, setError] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const skip = (page - 1) * pageSize;
            const data = await api.getPayments({
                search,
                skip,
                limit: pageSize,
                term: term || undefined,
                year: year ? parseInt(year) : undefined,
                sort_by: sortBy,
                order: sortOrder
            });
            setPayments(data);
            setTotal(data.length);
        } catch (err: unknown) {
            console.error('Failed to fetch payments:', err);
            const msg = err instanceof Error ? err.message : 'Failed to load payments.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [search, page, pageSize, term, year, sortBy, sortOrder]);

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                fetchPayments();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchPayments, user]);

    useEffect(() => {
        setPage(1);
    }, [search, pageSize, term, year, sortBy, sortOrder]);

    if (!user) return null;

    const totalPages = Math.ceil(total / pageSize) || 1;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        Fee Management
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Track and record student fee payments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/fees/add" className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Record Payment
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col xl:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student name or GR number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-40">
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Terms</option>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    <div className="relative group w-full sm:w-40">
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Years</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    <div className="relative group w-full sm:w-48">
                        <select
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split(':');
                                setSortBy(field);
                                setSortOrder(order as 'asc' | 'desc');
                            }}
                            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="created_at:desc">Recent Receipt</option>
                            <option value="created_at:asc">Oldest Receipt</option>
                            <option value="payment_method:asc">Payment Method (A-Z)</option>
                            <option value="payment_method:desc">Payment Method (Z-A)</option>
                            <option value="amount:desc">Highest Amount</option>
                            <option value="amount:asc">Lowest Amount</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                        <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setError(null)} />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500 animate-in fade-in duration-500">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Fetching ledger...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <CreditCard className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No payments recorded</h3>
                        <button onClick={() => { setSearch(''); setTerm(''); setYear(''); }} className="text-emerald-500 text-sm font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {payments.map((payment) => (
                            <div key={payment.id} className="group p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {payment.term} {payment.year}
                                    </div>
                                    <div className="text-emerald-500 font-black text-lg">
                                        ${payment.amount.toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                                        {payment.student?.name} {payment.student?.surname}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        GR: {payment.gr_no}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex-1">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-zinc-400 uppercase tracking-widest">Method</span>
                                        <span className="text-zinc-700 dark:text-zinc-300 uppercase">{payment.payment_method}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-zinc-400 uppercase tracking-widest">Date</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{new Date(payment.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPayment(payment)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold border border-zinc-100 dark:border-zinc-800"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Receipt
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-950/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Student</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Term/Year</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Method</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Date</th>
                                        <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{payment.student?.name} {payment.student?.surname}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GR: {payment.gr_no}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">{payment.term} - {payment.year}</span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                ${payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded uppercase tracking-widest">{payment.payment_method}</span>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="p-2.5 text-zinc-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Viewing:</span>
                        <div className="relative group">
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 pr-10 text-xs font-black text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer shadow-sm"
                            >
                                {PAGE_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Row{opt > 1 ? 's' : ''}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        Found <span className="text-emerald-500 mx-1">{total}</span> Transaction Records
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none">
                        {(() => {
                            const maxPages = 6;
                            let startPage = Math.max(1, page - Math.floor(maxPages / 2));
                            let endPage = startPage + maxPages - 1;

                            if (endPage > totalPages) {
                                endPage = totalPages;
                                startPage = Math.max(1, endPage - maxPages + 1);
                            }

                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(i);
                            }

                            return pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-11 h-11 rounded-2xl text-xs font-black transition-all shadow-sm",
                                        page === p
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-95"
                                            : "bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50"
                                    )}
                                >
                                    {p}
                                </button>
                            ));
                        })()}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Payment Summary Dialog */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500 p-8 text-white relative">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Payment Receipt</h4>
                                    <p className="text-2xl font-black">Ref #{selectedPayment.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Student Name</span>
                                    <span className="text-zinc-900 dark:text-white font-black">{selectedPayment.student?.name} {selectedPayment.student?.surname}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">GR Number</span>
                                    <span className="font-mono text-zinc-900 dark:text-white font-black">{selectedPayment.gr_no}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Term & Year</span>
                                    <span className="uppercase text-zinc-900 dark:text-white font-black">{selectedPayment.term} {selectedPayment.year}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Payment Method</span>
                                    <span className="uppercase text-zinc-900 dark:text-white font-black">{selectedPayment.payment_method}</span>
                                </div>
                                {selectedPayment.payment_details && (
                                    <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-2">
                                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Reference</span>
                                        <span className="text-zinc-900 dark:text-white font-black">{selectedPayment.payment_details}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Amount Paid</span>
                                <span className="text-3xl font-black text-emerald-500">${selectedPayment.amount.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[0.98] transition-transform"
                            >
                                Close Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
