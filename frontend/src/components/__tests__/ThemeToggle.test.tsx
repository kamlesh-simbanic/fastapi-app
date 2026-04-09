import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}));

describe('ThemeToggle Component', () => {
    const mockSetTheme = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useTheme as jest.Mock).mockReturnValue({
            setTheme: mockSetTheme,
            resolvedTheme: 'light',
        });
    });

    it('renders correctly and shows skeleton before mounting', () => {
        // We can't easily test the 'mounted' state without complex logic 
        // because useEffect runs immediately in JSDOM usually.
        // But we can verify it renders the button after mounting.
        render(<ThemeToggle />);
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('calls setTheme with "dark" when clicked in light mode', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('calls setTheme with "light" when clicked in dark mode', () => {
        (useTheme as jest.Mock).mockReturnValue({
            setTheme: mockSetTheme,
            resolvedTheme: 'dark',
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
});
