'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    CreditCard,
    Search,
    Loader2,
    ChevronDown,
    X,
    Plus
} from 'lucide-react';
import Table from '@/components/Table';
import { FeePayment } from './types';
import { getFeeColumns } from './utils';



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

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };


    if (!user) return null;


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Toolbar */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-success flex items-center justify-center shadow-lg shadow-success/20">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        Fee Management
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Track and record student fee payments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/fees/add" className="px-4 py-2 bg-success text-white rounded-xl text-sm font-bold hover:bg-success shadow-lg shadow-success/20 active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Record Payment
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col xl:flex-row items-center gap-4">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student name or GR number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all shadow-sm"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-xl text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-40">
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full appearance-none bg-card border border-border rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Terms</option>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="relative group w-full sm:w-40">
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full appearance-none bg-card border border-border rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All Years</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="relative group w-full sm:w-48">
                        <select
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split(':');
                                setSortBy(field);
                                setSortOrder(order as 'asc' | 'desc');
                            }}
                            className="w-full appearance-none bg-card border border-border rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-success/10 focus:border-success transition-all cursor-pointer shadow-sm"
                        >
                            <option value="created_at:desc">Recent Receipt</option>
                            <option value="created_at:asc">Oldest Receipt</option>
                            <option value="payment_method:asc">Payment Method (A-Z)</option>
                            <option value="payment_method:desc">Payment Method (Z-A)</option>
                            <option value="amount:desc">Highest Amount</option>
                            <option value="amount:asc">Lowest Amount</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                        <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setError(null)} />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground animate-in fade-in duration-500">
                        <Loader2 className="w-12 h-12 text-success animate-spin" />
                        <p className="font-bold text-sm tracking-widest uppercase opacity-70">Fetching ledger...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted/50 rounded-3xl border border-dashed border-border text-center">
                        <CreditCard className="w-12 h-12 text-zinc-300" />
                        <h3 className="text-lg font-bold text-foreground">No payments recorded</h3>
                        <button onClick={() => { setSearch(''); setTerm(''); setYear(''); }} className="text-success text-sm font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <Table
                        columns={getFeeColumns({
                            onView: setSelectedPayment
                        })}
                        data={payments}
                        loading={loading}
                        totalCount={total}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        emptyMessage="No payments recorded"
                    />
                )}
            </div>


            {/* Payment Summary Dialog */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-success p-8 text-white relative">
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
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-border pb-2">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Student Name</span>
                                    <span className="text-foreground font-black">{selectedPayment.student?.name} {selectedPayment.student?.surname}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-border pb-2">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">GR Number</span>
                                    <span className="font-mono text-foreground font-black">{selectedPayment.gr_no}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-border pb-2">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Term & Year</span>
                                    <span className="uppercase text-foreground font-black">{selectedPayment.term} {selectedPayment.year}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-border pb-2">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Payment Method</span>
                                    <span className="uppercase text-foreground font-black">{selectedPayment.payment_method}</span>
                                </div>
                                {selectedPayment.payment_details && (
                                    <div className="flex justify-between items-center text-sm border-b border-dashed border-zinc-100 dark:border-border pb-2">
                                        <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Reference</span>
                                        <span className="text-foreground font-black">{selectedPayment.payment_details}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-muted/50/50 p-6 rounded-3xl border border-zinc-100 dark:border-border flex justify-between items-center">
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Amount Paid</span>
                                <span className="text-3xl font-black text-success">${selectedPayment.amount.toLocaleString()}</span>
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
