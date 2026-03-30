'use client';

import React from 'react';
import { X, AlertTriangle, Info, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmBoxProps {
    isOpen: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export const ConfirmBox: React.FC<ConfirmBoxProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false
}) => {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: Trash2,
            iconClass: 'bg-red-500/10 text-red-500',
            buttonClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
            borderClass: 'border-red-500/30'
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'bg-amber-500/10 text-amber-500',
            buttonClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
            borderClass: 'border-amber-500/30'
        },
        info: {
            icon: Info,
            iconClass: 'bg-indigo-500/10 text-indigo-500',
            buttonClass: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20',
            borderClass: 'border-indigo-500/30'
        },
        success: {
            icon: CheckCircle,
            iconClass: 'bg-emerald-500/10 text-emerald-500',
            buttonClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
            borderClass: 'border-emerald-500/30'
        }
    };

    const { icon: Icon, iconClass, buttonClass, borderClass } = variants[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className={cn(
                "relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300",
                borderClass,
                "dark:border-zinc-800"
            )}>
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 space-y-6">
                    {/* Icon & Title */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn("p-4 rounded-3xl", iconClass)}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{title}</h2>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-[240px] leading-relaxed italic">{description}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={cn(
                                "w-full py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                                buttonClass,
                                loading && "opacity-50 cursor-not-allowed active:scale-100"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                confirmText
                            )}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
