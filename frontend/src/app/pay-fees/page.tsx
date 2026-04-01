'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    Search,
    User,
    CreditCard,
    Info,
    AlertCircle,
    CheckCircle2,
    QrCode,
    School,
    ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import Image from 'next/image';

interface StudentInfo {
    gr_no: string;
    name: string;
    surname: string;
    father_name: string;
    mobile: string;
}

export default function PublicFeePaymentPage() {
    const [grNo, setGrNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<StudentInfo | null>(null);
    const [feeAmount, setFeeAmount] = useState<number>(25000); // Default amount
    const [error, setError] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);

    const SCHOOL_UPI_ID = "kamleshthavani12345@okhdfcbank"; // Placeholder UPI ID
    const SCHOOL_NAME = "Simbanic School Management";

    const fetchStudent = async () => {
        if (!grNo.trim()) {
            setError("Please enter a valid GR Number.");
            return;
        }

        setLoading(true);
        setError(null);
        setStudent(null);
        setShowQR(false);

        try {
            const studentData = await api.getPublicStudent(grNo.trim());
            setStudent(studentData);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to fetch student details. Please check the GR Number.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handlePayUsingPG = async () => {
        if (!student) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.initiatePublicPayment({
                gr_no: student.gr_no,
                amount: feeAmount
            });
            if (res.success && res.redirectUrl) {
                window.location.href = res.redirectUrl;
            } else {
                throw new Error("Failed to get redirect URL");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Payment initiation failed.";
            setError(message);
            setLoading(false);
        }
    };

    const upiLink = student ? `upi://pay?pa=${SCHOOL_UPI_ID}&pn=${encodeURIComponent(SCHOOL_NAME)}&am=${feeAmount}&cu=INR&tn=${encodeURIComponent(`Fee Payment - GR: ${student.gr_no}`)}` : '';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-space selection:bg-emerald-500/30">
            {/* Elegant Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <School className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight italic">
                            FEE<span className="text-emerald-500">PAY</span>
                        </h2>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto space-y-10">

                    {/* Hero Section */}
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white leading-tight">
                            Secure <span className="text-emerald-500 italic">Fee Payment</span> Portal
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto font-medium">
                            Enter your GR Number below to verify your details and complete your annual fee payment securely.
                        </p>
                    </div>

                    {/* Input Card */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Student GR Number
                                </label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={grNo}
                                            onChange={(e) => setGrNo(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && fetchStudent()}
                                            placeholder="Enter GR Number (e.g., GR1001)"
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-zinc-900 dark:text-zinc-100 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={fetchStudent}
                                        disabled={loading}
                                        className="px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-zinc-900/10 disabled:opacity-50"
                                    >
                                        {loading ? "Fetching..." : "Verify"}
                                        {!loading && <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            {student && (
                                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Student Details</p>
                                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter">
                                                            {student.name} {student.surname}
                                                        </h3>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Father&apos;s Name</p>
                                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{student.father_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Mobile</p>
                                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{student.mobile}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3" /> Amount to Pay (₹)
                                                </p>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={feeAmount}
                                                        onChange={(e) => setFeeAmount(parseInt(e.target.value) || 0)}
                                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-3xl text-zinc-900 dark:text-white tabular-nums tracking-tighter italic transition-all"
                                                    />
                                                </div>
                                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                    <Info className="w-3 h-3" />
                                                    Enter the fee amount you wish to pay.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <button
                                                onClick={handlePayUsingPG}
                                                disabled={loading || !student}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                            >
                                                {loading ? "Redirecting..." : "Pay via PhonePe Gateway"}
                                            </button>

                                            <div className="flex items-center gap-4 w-full">
                                                <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">OR</span>
                                                <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
                                            </div>

                                            {!showQR ? (
                                                <button
                                                    onClick={() => setShowQR(true)}
                                                    className="w-full h-full min-h-[160px] rounded-[2.5rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex flex-col items-center justify-center gap-4 group transition-all hover:scale-[1.02] shadow-2xl shadow-zinc-900/20"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <QrCode className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Generate UPI QR</p>
                                                        <p className="text-[9px] opacity-60 font-bold italic">Static QR Code</p>
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="animate-in zoom-in-90 duration-500 p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 flex flex-col items-center space-y-6">
                                                    <div className="p-4 bg-zinc-50 rounded-2xl">
                                                        <QRCodeSVG
                                                            value={upiLink}
                                                            size={160}
                                                            level="H"
                                                            includeMargin={true}
                                                            imageSettings={{
                                                                src: "/images/phonepe.png",
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 32,
                                                                width: 32,
                                                                excavate: true,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <p className="text-xs font-black text-zinc-900 uppercase tracking-widest">Scan to Pay</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm">
                                                                <Image src="/images/phonepe.png" alt="PhonePe" fill className="object-cover" />
                                                            </div>
                                                            <div className="w-px h-3 bg-zinc-200" />
                                                            <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm">
                                                                <Image src="/images/gpay.png" alt="GPay" fill className="object-cover" />
                                                            </div>
                                                            <div className="w-px h-3 bg-zinc-200" />
                                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">UPI Enabled</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10 text-center space-y-4">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Payment Security</p>
                        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                            Your payment is processed through encrypted UPI channels. Scan with any UPI-enabled app like Google Pay, PhonePe, or Paytm.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
