'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Layers, ShieldCheck } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!authLoading) {
            console.log("user", user);

            if (!user) {
                router.push('/login');
            } else if (!hasPermission(pathname, user.department)) {
                router.push('/');
            }
        }
    }, [user, authLoading, router, pathname]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-2xl animate-bounce">
                        <Layers className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] italic animate-pulse">
                        Verifying Governance Credentials...
                    </p>
                    <div className="flex justify-center gap-1.5 leading-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    </div>
                </div>
            </div>
        );
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
