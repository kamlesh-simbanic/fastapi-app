/**
 * MUI-Style Theme Tokens for Tailwind v4
 * 
 * Access these using Tailwind classes (e.g., bg-primary-main, text-secondary-contrast)
 * or via this object for dynamic React logic.
 */

export const theme = {
    palette: {
        primary: {
            main: 'var(--color-blue-600)',
            light: 'var(--color-blue-500)',
            dark: 'var(--color-blue-700)',
            contrastText: '#ffffff',
        },
        secondary: {
            main: 'var(--color-zinc-600)',
            light: 'var(--color-zinc-500)',
            dark: 'var(--color-zinc-700)',
            contrastText: '#ffffff',
        },
        error: {
            main: 'var(--color-red-600)',
        },
        warning: {
            main: 'var(--color-amber-500)',
        },
        success: {
            main: 'var(--color-green-600)',
        },
        info: {
            main: 'var(--color-blue-400)',
        },
        background: {
            default: 'var(--background)',
            paper: 'var(--color-zinc-50)',
        },
    },
    typography: {
        fontFamily: 'var(--font-sans)',
        h1: {
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-black)',
        },
        h2: {
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)',
        },
        body1: {
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
        },
    },
    spacing: (factor: number) => `${factor * 0.25}rem`, // 4px base
    shape: {
        borderRadius: {
            medium: '12px',
            large: '16px',
        },
    },
};
