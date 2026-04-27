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
            iconClass: 'bg-destructive/10 text-destructive',
            buttonClass: 'bg-destructive hover:bg-destructive/90 shadow-destructive/20',
            borderClass: 'border-destructive/30'
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'bg-warning/10 text-warning',
            buttonClass: 'bg-warning hover:bg-warning/90 shadow-warning/20',
            borderClass: 'border-warning/30'
        },
        info: {
            icon: Info,
            iconClass: 'bg-primary/10 text-primary',
            buttonClass: 'bg-primary hover:bg-primary/90 shadow-primary/20',
            borderClass: 'border-primary/30'
        },
        success: {
            icon: CheckCircle,
            iconClass: 'bg-success/10 text-success',
            buttonClass: 'bg-success hover:bg-success/90 shadow-success/20',
            borderClass: 'border-success/30'
        }
    };

    const { icon: Icon, iconClass, buttonClass, borderClass } = variants[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className={cn(
                "relative bg-card w-full max-w-sm rounded-[2.5rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300",
                borderClass,
                "border-border"
            )}>
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
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
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h2>
                            <p className="text-sm font-medium text-muted-foreground max-w-[240px] leading-relaxed italic">{description}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={cn(
                                "w-full py-4 rounded-2xl text-primary-foreground text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                                buttonClass,
                                loading && "opacity-50 cursor-not-allowed active:scale-100"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                            ) : (
                                confirmText
                            )}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground text-xs font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 border border-border"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};
