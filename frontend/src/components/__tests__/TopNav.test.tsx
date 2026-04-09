import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopNav } from '@/components/TopNav';
import { useAuth } from '@/context/AuthContext';

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock ThemeToggle to avoid its internal logic
jest.mock('@/components/ThemeToggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('TopNav Component', () => {
    const mockLogout = jest.fn();
    const mockUser = { name: 'John Doe', email: 'john@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            logout: mockLogout,
        });
    });

    it('renders user name and search input', () => {
        render(<TopNav />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search everything/i)).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('calls onMenuClick when menu button is clicked', () => {
        const onMenuClick = jest.fn();
        render(<TopNav onMenuClick={onMenuClick} />);

        const menuButton = screen.getAllByRole('button')[0];
        fireEvent.click(menuButton);

        expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('calls logout when sign out button is clicked', () => {
        render(<TopNav />);

        const signOutButton = screen.getByText(/sign out/i);
        fireEvent.click(signOutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});
