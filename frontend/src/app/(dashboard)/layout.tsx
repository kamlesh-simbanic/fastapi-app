'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Layers } from 'lucide-react';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Layers className="w-12 h-12 text-indigo-500 animate-pulse" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
