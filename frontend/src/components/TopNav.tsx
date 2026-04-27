'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
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
        <header className="h-16 border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-muted rounded-lg lg:hidden text-muted-foreground"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="max-w-md w-full relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />

                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg relative transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-foreground leading-none mb-1">{user?.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Administrator</span>
                    </div>

                    <div className="relative group/user">
                        <button className="flex items-center gap-2 p-1 rounded-full border border-border bg-muted/50 hover:border-primary/50 transition-all">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground mr-1 opacity-60 group-hover/user:opacity-100" />
                        </button>

                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-1.5 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <User className="w-4 h-4" />
                                Profile Settings
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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

