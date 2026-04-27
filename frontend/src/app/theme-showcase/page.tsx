'use client';

import React from 'react';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Layers,
    Palette,
    Type,
    Layout
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ThemeShowcase() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Theme Showcase</h1>
                        <p className="text-muted-foreground text-lg">
                            A comprehensive view of the design system, tokens, and components.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground mr-2">Toggle Theme:</span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Colors Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-semibold">Color Palette</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Core Colors */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Core Colors</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-primary shadow-lg shadow-primary/20" />
                                    <div>
                                        <p className="font-semibold">Primary</p>
                                        <p className="text-xs text-muted-foreground">var(--primary)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-accent shadow-lg shadow-accent/20" />
                                    <div>
                                        <p className="font-semibold">Accent</p>
                                        <p className="text-xs text-muted-foreground">var(--accent)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-secondary" />
                                    <div>
                                        <p className="font-semibold">Secondary</p>
                                        <p className="text-xs text-muted-foreground">var(--secondary)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Semantic Colors */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Semantic</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-success shadow-lg shadow-success/20" />
                                    <div>
                                        <p className="font-semibold">Success</p>
                                        <p className="text-xs text-muted-foreground">var(--success)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-warning shadow-lg shadow-warning/20" />
                                    <div>
                                        <p className="font-semibold">Warning</p>
                                        <p className="text-xs text-muted-foreground">var(--warning)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg bg-destructive shadow-lg shadow-destructive/20" />
                                    <div>
                                        <p className="font-semibold">Destructive</p>
                                        <p className="text-xs text-muted-foreground">var(--destructive)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Neutral / Surfaces */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Neutral & Surfaces</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-background">
                                    <div className="w-12 h-12 rounded-lg bg-foreground" />
                                    <div>
                                        <p className="font-semibold">Foreground</p>
                                        <p className="text-xs text-muted-foreground">Text color</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted">
                                    <div className="w-12 h-12 rounded-lg border border-border" />
                                    <div>
                                        <p className="font-semibold">Muted</p>
                                        <p className="text-xs text-muted-foreground">var(--muted)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                                    <div className="w-12 h-12 rounded-lg border border-border" />
                                    <div>
                                        <p className="font-semibold">Card</p>
                                        <p className="text-xs text-muted-foreground">var(--card)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Type className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-semibold">Typography</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 rounded-3xl border border-border bg-card/50">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-bold">The quick brown fox</h1>
                            <h2 className="text-4xl font-semibold">The quick brown fox</h2>
                            <h3 className="text-3xl font-medium">The quick brown fox</h3>
                            <h4 className="text-2xl font-medium">The quick brown fox</h4>
                            <p className="text-xl">The quick brown fox jumps over the lazy dog.</p>
                        </div>
                        <div className="space-y-6">
                            <p className="text-base text-foreground leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                                Supporting text or descriptions using the muted-foreground variable to provide visual hierarchy and contrast.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">Badge</span>
                                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold uppercase tracking-wider">Accent</span>
                                <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold uppercase tracking-wider">Success</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interactive Components Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-semibold">Interactive Components</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Buttons */}
                        <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                            <h3 className="text-lg font-semibold">Buttons</h3>
                            <div className="flex flex-col gap-4">
                                <button className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-all active:scale-95">
                                    Primary Button
                                </button>
                                <button className="w-full bg-accent text-accent-foreground py-2.5 px-4 rounded-xl font-medium shadow-lg shadow-accent/25 hover:opacity-90 transition-all active:scale-95">
                                    Accent Button
                                </button>
                                <button className="w-full border border-border hover:bg-muted py-2.5 px-4 rounded-xl font-medium transition-all active:scale-95">
                                    Outline Button
                                </button>
                            </div>
                        </div>

                        {/* Visual Feedback */}
                        <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                            <h3 className="text-lg font-semibold">Visual Feedback</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 text-success border border-success/20">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Operation completed successfully</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 text-warning border border-warning/20">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Please review your changes</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">An error has occurred</span>
                                </div>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="group relative overflow-hidden p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Layout className="w-12 h-12" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Hover Effect</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                Cards use smooth transitions and subtle borders to create a premium feel.
                            </p>
                            <div className="flex items-center text-primary text-sm font-semibold">
                                Learn more
                                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
