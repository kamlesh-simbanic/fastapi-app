import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardLayout } from '@/components/DashboardLayout';

// Mock the sub-components
jest.mock('@/components/SideNav', () => ({
    SideNav: ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => (
        <div data-testid="side-nav" data-isopen={isOpen}>
            <button onClick={() => setIsOpen(!isOpen)} data-testid="toggle-sidebar">Toggle</button>
        </div>
    ),
}));

jest.mock('@/components/TopNav', () => ({
    TopNav: ({ onMenuClick }: { onMenuClick: () => void }) => (
        <div data-testid="top-nav">
            <button onClick={onMenuClick} data-testid="menu-click">Menu</button>
        </div>
    ),
}));

describe('DashboardLayout Component', () => {
    const originalInnerWidth = window.innerWidth;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        window.innerWidth = originalInnerWidth;
    });

    it('renders children correctly', () => {
        render(
            <DashboardLayout>
                <div data-testid="test-child">Child Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByTestId('side-nav')).toBeInTheDocument();
        expect(screen.getByTestId('top-nav')).toBeInTheDocument();
    });

    it('opens sidebar on large screens by default', () => {
        // Change innerWidth to 1200
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });

        render(<DashboardLayout><div>Content</div></DashboardLayout>);

        expect(screen.getByTestId('side-nav')).toHaveAttribute('data-isopen', 'true');
    });

    it('toggles sidebar when clicking menu in TopNav', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
        render(<DashboardLayout><div>Content</div></DashboardLayout>);

        const menuBtn = screen.getByTestId('menu-click');
        fireEvent.click(menuBtn);

        expect(screen.getByTestId('side-nav')).toHaveAttribute('data-isopen', 'true');
    });

    it('closes sidebar when clicking overlay on mobile', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });

        // Use a wrapper to re-render or just fire click
        const { container } = render(<DashboardLayout><div>Content</div></DashboardLayout>);

        // Open first
        fireEvent.click(screen.getByTestId('menu-click'));
        expect(screen.getByTestId('side-nav')).toHaveAttribute('data-isopen', 'true');

        // Find overlay (bg-black/60)
        // In DashboardLayout.tsx: isSidebarOpen && <div className="fixed inset-0 bg-black/60 ..." onClick={() => setIsSidebarOpen(false)} />
        const overlay = container.querySelector('.bg-black\\/60');
        if (overlay) {
            fireEvent.click(overlay);
        }

        expect(screen.getByTestId('side-nav')).toHaveAttribute('data-isopen', 'false');
    });
});
