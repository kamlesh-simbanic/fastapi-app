'use client';

import React from 'react';
import { theme } from '@/lib/theme';
import {
    Palette,
    Type,
    Square,
    Layers,
    Sun,
    Moon,
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeShowcasePage() {
    const { theme: currentTheme, setTheme } = useTheme();

    const colors = [
        { name: 'Primary', main: 'bg-primary-main', light: 'bg-primary-light', dark: 'bg-primary-dark', text: 'text-primary-contrast' },
        { name: 'Secondary', main: 'bg-secondary-main', light: 'bg-secondary-light', dark: 'bg-secondary-dark', text: 'text-secondary-contrast' },
    ];

    const statusColors = [
        { name: 'Success', color: 'bg-success', icon: CheckCircle2 },
        { name: 'Error', color: 'bg-error', icon: AlertCircle },
        { name: 'Warning', color: 'bg-warning', icon: AlertTriangle },
        { name: 'Info', color: 'bg-info', icon: Info },
    ];

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-h1 font-weight-h1 tracking-tight text-zinc-900 dark:text-white">
                        Theme System Console
                    </h1>
                    <p className="text-primary-main font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic">MUI-Inspired Design Tokens</p>
                </div>
                <button
                    onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-3 px-6 py-3 rounded-radius-medium bg-surface-ground border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
                >
                    {currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
            </section>

            {/* Palette */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Palette className="w-5 h-5 text-primary-main" />
                    <h2 className="text-h2 font-weight-h2 tracking-tight">Color Palette</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {colors.map((c) => (
                        <div key={c.name} className="p-8 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                            <h3 className="text-h4 font-bold uppercase tracking-widest text-zinc-400">{c.name} Spectrum</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className={`h-24 ${c.light} rounded-radius-medium shadow-inner`} />
                                    <p className="text-[10px] font-bold text-center uppercase tracking-tighter opacity-60">Light</p>
                                </div>
                                <div className="space-y-2">
                                    <div className={`h-24 ${c.main} rounded-radius-medium shadow-lg flex items-center justify-center`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>Main</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-center uppercase tracking-tighter">Default</p>
                                </div>
                                <div className="space-y-2">
                                    <div className={`h-24 ${c.dark} rounded-radius-medium shadow-inner`} />
                                    <p className="text-[10px] font-bold text-center uppercase tracking-tighter opacity-60">Dark</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                    {statusColors.map((s) => (
                        <div key={s.name} className={`p-6 rounded-radius-medium ${s.color} bg-opacity-10 border border-current flex flex-col items-center gap-4 group hover:scale-105 transition-transform`}>
                            <s.icon className={`w-8 h-8 ${s.name.toLowerCase() === 'warning' ? 'text-warning' : `text-${s.name.toLowerCase()}`}`} />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{s.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Typography */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Type className="w-5 h-5 text-primary-main" />
                    <h2 className="text-h2 font-weight-h2 tracking-tight">Typography</h2>
                </div>
                <div className="p-10 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 space-y-10 shadow-sm">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary-main uppercase tracking-[0.3em] mb-4">Headlines</p>
                        <h1 className="text-h1 font-weight-h1 tracking-tighter">Heading 1: Institutional Intelligence</h1>
                        <h2 className="text-h2 font-weight-h2 tracking-tight">Heading 2: Faculty Administration</h2>
                        <h3 className="text-h3 font-bold tracking-tight">Heading 3: Financial Treasury Log</h3>
                        <h4 className="text-h4 font-bold tracking-tight">Heading 4: Daily Registry Entry</h4>
                        <h5 className="text-h5 font-bold tracking-tight">Heading 5: Student Identification</h5>
                        <h6 className="text-h6 font-bold tracking-tight">Heading 6: System Annotations</h6>
                    </div>
                </div>
            </section>

            {/* Shapes & Spacing */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Layers className="w-5 h-5 text-primary-main" />
                    <h2 className="text-h2 font-weight-h2 tracking-tight">Shapes & Surfaces</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-12 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-radius-large bg-primary-main shadow-2xl flex items-center justify-center">
                            <Square className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Large Radius (16px)</p>
                    </div>
                    <div className="p-12 rounded-radius-medium bg-surface-paper border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-radius-medium bg-primary-main shadow-lg flex items-center justify-center">
                            <Square className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Medium Radius (12px)</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
