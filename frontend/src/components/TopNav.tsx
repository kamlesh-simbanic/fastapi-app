'use client';

import React from 'react';
import { useAuth } from '@/components/AuthContext';
import {
    Search,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Menu
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
    onMenuClick?: () => void;
}

export const TopNav = React.memo(function TopNav({ onMenuClick }: TopNavProps) {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg lg:hidden text-zinc-500 dark:text-zinc-400"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="max-w-md w-full relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />

                <button className="p-2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg relative transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-950" />
                </button>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-none mb-1">{user?.name}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium uppercase tracking-wider">Administrator</span>
                    </div>

                    <div className="relative group/user">
                        <button className="flex items-center gap-2 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-zinc-500 mr-1 opacity-60 group-hover/user:opacity-100" />
                        </button>

                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <User className="w-4 h-4" />
                                Profile Settings
                            </button>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});
