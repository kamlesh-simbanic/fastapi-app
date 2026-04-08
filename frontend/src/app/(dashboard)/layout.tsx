'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlobalDataProvider } from '@/context/GlobalContext';
import { Layers } from 'lucide-react';
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

            if (!user) {
                router.push('/login');
            } else if (!hasPermission(pathname, user.department)) {
                router.push('/');
            }
        }
    }, [user, authLoading, router, pathname]);

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

    return (
        <GlobalDataProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </GlobalDataProvider>
    );
}
