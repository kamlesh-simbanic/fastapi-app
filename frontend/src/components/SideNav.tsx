'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Briefcase,
    Calendar,
    CalendarDays,
    Settings,
    HelpCircle,
    Layers,
    ChevronLeft,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: Layers, label: 'Classes', href: '/classes' },
    { icon: Calendar, label: 'Attendance', href: '/attendance' },
    { icon: CalendarDays, label: 'Holidays', href: '/holidays' },
    { icon: CreditCard, label: 'Fees', href: '/fees' },
    { icon: CreditCard, label: 'Fee Structure', href: '/fee-structure' },
    { icon: Briefcase, label: 'Staff', href: '/staff' },
    { icon: BookOpen, label: 'Subjects', href: '/subjects' },
    { icon: CalendarDays, label: 'Timetable', href: '/timetable' },
    { icon: Calendar, label: 'Leave Management', href: '/leave' },
];

const secondaryItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Support', href: '/support' },
];

interface SideNavProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const SideNav = React.memo(function SideNav({ isOpen, setIsOpen }: SideNavProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    const filteredNavItems = navItems.filter(item => {
        if (!user) return false;
        // Dashboard is accessible to everyone
        if (item.href === '/') return true;

        const allowed = PERMISSIONS[item.href];
        if (!allowed) return true;

        return !user.department || user.department === 'admin' || allowed.includes(user.department || 'other');
    });

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 overflow-hidden",
            isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
        )}>
            <div className="flex flex-col h-full w-64">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50 mb-6 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className={cn(
                        "font-bold text-xl italic tracking-tight transition-all duration-300 whitespace-nowrap text-foreground",
                        isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                    )}>
                        FastStack
                    </span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                    isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                                )}>
                                    {item.label}
                                </span>
                                {!isOpen && (
                                    <div className="absolute left-14 px-2 py-1 rounded bg-foreground text-background text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity hidden lg:block shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Secondary Nav */}
                <div className="px-3 pb-6 pt-6 border-t border-border/50 space-y-1">
                    {secondaryItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all group relative"
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className={cn(
                                "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                            )}>
                                {item.label}
                            </span>
                            {!isOpen && (
                                <div className="absolute left-14 px-2 py-1 rounded bg-foreground text-background text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity hidden lg:block shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all group hidden lg:flex"
                    >
                        <ChevronLeft className={cn(
                            "w-5 h-5 transition-transform duration-300 flex-shrink-0",
                            !isOpen && "rotate-180"
                        )} />
                        <span className={cn(
                            "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                            isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                        )}>
                            Collapse
                        </span>
                    </button>
                </div>
            </div>
        </aside>

    );
});
