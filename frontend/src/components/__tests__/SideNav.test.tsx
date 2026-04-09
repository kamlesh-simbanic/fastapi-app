import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SideNav } from '@/components/SideNav';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// Mock dependencies
jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

describe('SideNav Component', () => {
    const mockSetIsOpen = jest.fn();
    const mockUser = { id: '1', name: 'Admin User', department: 'admin' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
        (usePathname as jest.Mock).mockReturnValue('/');
    });

    it('renders navigation items', () => {
        render(<SideNav isOpen={true} setIsOpen={mockSetIsOpen} />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('filters items based on user department', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { ...mockUser, department: 'teaching' }
        });

        render(<SideNav isOpen={true} setIsOpen={mockSetIsOpen} />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Attendance')).toBeInTheDocument();
        expect(screen.queryByText('Staff')).not.toBeInTheDocument();
    });

    it('highlights active link', () => {
        (usePathname as jest.Mock).mockReturnValue('/students');
        render(<SideNav isOpen={true} setIsOpen={mockSetIsOpen} />);

        // Use getAllByText because label might be in tooltip too
        const studentsLinks = screen.getAllByText('Students');
        const activeLink = studentsLinks[0].closest('a');
        expect(activeLink).toHaveClass('text-indigo-600');
    });

    it('calls setIsOpen when collapse button is clicked', () => {
        render(<SideNav isOpen={true} setIsOpen={mockSetIsOpen} />);

        const collapseBtnArr = screen.getAllByText(/collapse/i);
        fireEvent.click(collapseBtnArr[0]);

        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('hides labels when closed', () => {
        render(<SideNav isOpen={false} setIsOpen={mockSetIsOpen} />);

        // Find the label in the primary span
        const dashboardLabels = screen.getAllByText('Dashboard');
        // The first one is the span, the second one is the tooltip
        expect(dashboardLabels[0]).toHaveClass('opacity-0');
    });
});
