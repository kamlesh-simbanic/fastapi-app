'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl bg-muted border border-border animate-pulse" />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-lg shadow-black/5 dark:shadow-black/20"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-5 h-5 transition-all duration-300" />
            ) : (
                <Moon className="w-5 h-5 transition-all duration-300" />
            )}
        </button>
    );
}

