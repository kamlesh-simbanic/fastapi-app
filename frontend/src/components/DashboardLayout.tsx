'use client';

import React, { useState } from 'react';
import { SideNav } from './SideNav';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        // Open sidebar by default on large screens
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 print:bg-white print:text-black">
            <div className="print:hidden">
                <SideNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 print:ml-0",
                isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
            )}>
                <div className="print:hidden">
                    <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative print:p-0">
                    {/* Subtle Page Background Decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />

                    <div className="max-w-7xl mx-auto h-full print:max-w-none">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden print:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
