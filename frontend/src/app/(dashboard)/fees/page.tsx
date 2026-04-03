'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import {
    Search,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ChevronDown,
    X,
    Eye,
    Plus,
    Receipt,
    Wallet,
    TrendingUp,
    Filter,
    AlertCircle
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
            {/* Header / Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-radius-medium bg-primary-main flex items-center justify-center shadow-xl shadow-primary-main/20 ring-4 ring-primary-main/5">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white tracking-tight italic">
                                Fee Collections
                            </h1>
                            <p className="text-primary-main font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic">Fee Ledger Central</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-radius-medium border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2.5 rounded-md transition-all",
                                viewMode === 'grid'
                                    ? "bg-white dark:bg-zinc-700 text-primary-main shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2.5 rounded-md transition-all",
                                viewMode === 'list'
                                    ? "bg-white dark:bg-zinc-700 text-primary-main shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        href="/fees/add"
                        className="flex items-center gap-2.5 bg-primary-main text-white px-8 py-4 rounded-radius-medium font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary-main/20 hover:bg-primary-dark transition-all active:scale-95 italic"
                    >
                        <Plus className="w-4 h-4" />
                        Record Fee Payment
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col lg:flex-row items-center gap-6 p-1 bg-surface-ground rounded-radius-large">
                <div className="relative group w-full lg:flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary-main transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student name or GR number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium py-4 l-14 pr-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all shadow-sm placeholder:text-zinc-300 italic pl-16 pr-12"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-50 rounded-lg text-zinc-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto px-4 lg:px-0">
                    <div className="relative group min-w-[140px] flex-1 lg:flex-none">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium pl-10 pr-10 py-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all cursor-pointer shadow-sm italic"
                        >
                            <option value="">All Terms</option>
                            <option value="summer">Term 1</option>
                            <option value="winter">Term 2</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="relative group min-w-[120px] flex-1 lg:flex-none">
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium px-5 py-4 pr-10 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all cursor-pointer shadow-sm italic"
                        >
                            <option value="">All Years</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y}>Session {y}</option>;
                            })}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="relative group min-w-[180px] flex-1 lg:flex-none">
                        <select
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split(':');
                                setSortBy(field);
                                setSortOrder(order as 'asc' | 'desc');
                            }}
                            className="w-full appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium px-5 py-4 pr-10 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 focus:border-primary-main transition-all cursor-pointer shadow-sm italic"
                        >
                            <option value="created_at:desc">Recent Collections</option>
                            <option value="created_at:asc">Oldest Records</option>
                            <option value="amount:desc">Highest Value</option>
                            <option value="amount:asc">Lowest Value</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {error && (
                    <div className="mb-8 p-5 rounded-radius-medium bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-center gap-4 text-error animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold italic tracking-tight flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 text-zinc-500 animate-in fade-in duration-500">
                        <Loader2 className="w-16 h-16 text-primary-main animate-spin" />
                        <div className="text-center space-y-1">
                            <p className="font-bold text-xs tracking-[0.3em] uppercase opacity-70 italic">Loading Fee Records...</p>
                            <p className="text-[10px] font-bold text-zinc-400 animate-pulse italic uppercase tracking-widest">Updating Institutional Ledger</p>
                        </div>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8 bg-surface-ground rounded-radius-large border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-in fade-in duration-700">
                        <div className="w-20 h-20 rounded-radius-large bg-primary-main/5 flex items-center justify-center border border-primary-main/10 shadow-inner">
                            <Receipt className="w-10 h-10 text-primary-main opacity-40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-h2 font-weight-h2 text-zinc-900 dark:text-white tracking-tight italic">No Payments Recovered</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto font-medium italic opacity-70">No fee payments match the selected institutional criteria.</p>
                        </div>
                        <button
                            onClick={() => { setSearch(''); setTerm(''); setYear(''); }}
                            className="text-primary-main font-bold text-xs uppercase tracking-[0.3em] hover:opacity-70 transition-opacity decoration-2 underline-offset-8 italic border-b-2 border-primary-main/30"
                        >
                            Reset Parameter Search
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                        {payments.map((payment) => (
                            <div key={payment.id} className="group bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl hover:shadow-primary-main/5 transition-all duration-300 hover:border-primary-main/20 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/5 -mr-12 -mt-12 rounded-full blur-3xl group-hover:bg-primary-main/10 transition-colors" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="px-3 py-1.5 rounded-radius-medium bg-zinc-50 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-100 dark:border-zinc-700 italic">
                                        Term {payment.term === 'summer' ? '1' : '2'} &bull; {payment.year}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-primary-main font-bold text-2xl tracking-tighter italic">
                                            ₹{payment.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5 mb-8 relative z-10 flex-1">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight group-hover:italic group-hover:text-primary-main transition-all">
                                        {payment.student?.name} {payment.student?.surname}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-main opacity-40" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                                            GR NO: {payment.gr_no}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Collection Date</span>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 italic">
                                            {new Date(payment.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Method</span>
                                        <span className="text-[10px] font-bold text-primary-main dark:text-primary-light uppercase tracking-widest px-2 py-1 bg-primary-main/5 border border-primary-main/10 rounded-radius-medium italic">
                                            {payment.payment_method.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPayment(payment)}
                                    className="mt-8 w-full flex items-center justify-center gap-2.5 py-4 rounded-radius-medium bg-surface-ground dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-primary-main hover:text-white hover:shadow-lg hover:shadow-primary-main/20 transition-all text-[10px] font-bold uppercase tracking-[0.2em] border border-zinc-100 dark:border-zinc-700 italic group-hover:border-primary-main/20"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Receipt
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-paper dark:bg-zinc-900 rounded-radius-large border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-surface-ground">
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Student Profile</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Session Details</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Payment Value</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Mode</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">Transaction Date</th>
                                        <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight group-hover:italic group-hover:text-primary-main transition-all">{payment.student?.name} {payment.student?.surname}</span>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] italic opacity-60">GR NO: {payment.gr_no}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest italic">{payment.term === 'summer' ? 'Term 1' : 'Term 2'} &bull; Session {payment.year}</span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-primary-main dark:text-primary-light italic">
                                                ₹{payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[9px] font-bold bg-primary-main/5 text-primary-main dark:text-primary-light px-2.5 py-1 rounded uppercase tracking-[0.2em] border border-primary-main/10 italic">
                                                    {payment.payment_method.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic opacity-70">
                                                {new Date(payment.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="p-3 text-zinc-300 hover:text-primary-main hover:bg-primary-main/5 rounded-radius-medium transition-all shadow-sm"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row items-center gap-10 px-4 lg:px-0">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] italic">Entries per viewport:</span>
                        <div className="relative group">
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="appearance-none bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-radius-medium px-5 py-2.5 pr-12 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary-main/5 cursor-pointer shadow-sm italic"
                            >
                                {PAGE_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Personnel</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-primary-main opacity-50" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] italic">
                            Identified <span className="text-primary-main font-black mx-1">{total}</span> Valid Records
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        className="p-4 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 bg-surface-paper dark:bg-zinc-900 text-zinc-500 hover:text-primary-main disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {(() => {
                            const maxPages = 4;
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
                                        "w-12 h-12 rounded-radius-medium text-[10px] font-bold uppercase transition-all shadow-sm italic",
                                        page === p
                                            ? "bg-primary-main text-white shadow-xl shadow-primary-main/30 ring-4 ring-primary-main/10 active:scale-95"
                                            : "bg-surface-paper dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50"
                                    )}
                                >
                                    {p.toString().padStart(2, '0')}
                                </button>
                            ));
                        })()}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        className="p-4 rounded-radius-medium border border-zinc-100 dark:border-zinc-800 bg-surface-paper dark:bg-zinc-900 text-zinc-500 hover:text-primary-main disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Receipt Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-zinc-950/60 animate-in fade-in duration-300">
                    <div className="bg-surface-paper dark:bg-zinc-900 w-full max-w-xl rounded-radius-large shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="bg-primary-main p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 -mr-32 -mt-32 rounded-full blur-3xl animate-pulse" />

                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-radius-medium transition-all z-10 text-white/70 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-radius-medium bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                                    <Receipt className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-1 italic">Institutional Receipt</h4>
                                    <p className="text-3xl font-black tracking-tight italic flex items-center gap-2">
                                        ID: <span className="opacity-50">#{selectedPayment.id.toString().padStart(6, '0')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 italic">Student Registry</p>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight italic">
                                        {selectedPayment.student?.name} {selectedPayment.student?.surname}
                                    </p>
                                    <p className="text-[10px] font-bold text-primary-main uppercase tracking-[0.2em] italic">GR NO: {selectedPayment.gr_no}</p>
                                </div>
                                <div className="space-y-1.5 md:text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 italic">Transaction Logged</p>
                                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest italic">
                                        {new Date(selectedPayment.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] font-bold text-success uppercase tracking-[0.2em] italic opacity-80 animate-pulse">Confirmed by Treasury</p>
                                </div>
                            </div>

                            <div className="p-10 rounded-radius-large bg-surface-ground dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-8 shadow-inner">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[9px] italic">Academic Session</span>
                                    <span className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px] italic">Term {selectedPayment.term === 'summer' ? '1' : '2'} &bull; {selectedPayment.year}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[9px] italic">Method of Transfer</span>
                                    <span className="text-[10px] font-black bg-primary-main/5 text-primary-main px-3 py-1 rounded-radius-medium uppercase tracking-[0.2em] border border-primary-main/10 shadow-sm italic">{selectedPayment.payment_method.toUpperCase()}</span>
                                </div>
                                {selectedPayment.payment_details && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[9px] italic">External Reference</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 font-black italic text-[10px] tracking-widest">{selectedPayment.payment_details}</span>
                                    </div>
                                )}
                                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-[0.4em] italic">Net Value Credited</span>
                                    <span className="text-4xl font-black text-primary-main tracking-tighter italic">₹{selectedPayment.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="w-full py-5 bg-primary-main text-white rounded-radius-medium text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl shadow-primary-main/20 hover:bg-primary-dark transition-all active:scale-95 italic ring-4 ring-primary-main/5"
                            >
                                Finalize View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
