import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import StudentsPage from '@/app/(dashboard)/students/page';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock next/link to avoid issues with its internals
jest.mock('next/link', () => {
    return function LinkMock({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Comprehensive mock for Lucide icons used across the module
jest.mock('lucide-react', () => ({
    Users: function UsersMock() { return <div data-testid="users-icon" />; },
    Search: function SearchMock() { return <div data-testid="search-icon" />; },
    GraduationCap: function GraduationCapMock() { return <div data-testid="grad-cap-icon" />; },
    Loader2: function Loader2Mock() { return <div data-testid="loader-icon" />; },
    ChevronDown: function ChevronDownMock() { return <div data-testid="chevron-down-icon" />; },
    ChevronLeft: function ChevronLeftMock() { return <div data-testid="chevron-left-icon" />; },
    ChevronRight: function ChevronRightMock() { return <div data-testid="chevron-right-icon" />; },
    ArrowUp: function ArrowUpMock() { return <div data-testid="arrow-up-icon" />; },
    ArrowDown: function ArrowDownMock() { return <div data-testid="arrow-down-icon" />; },
    ArrowUpDown: function ArrowUpDownMock() { return <div data-testid="arrow-up-down-icon" />; },
    Pencil: function PencilMock() { return <div data-testid="pencil-icon" />; },
    X: function XMock() { return <div data-testid="x-icon" />; },
}));

const mockStudents = [
    {
        id: 1,
        gr_no: 'GR-2026-0001',
        name: 'John',
        father_name: 'Doe',
        surname: 'Smith',
        mobile: '1234567890',
        dob: '2010-01-01',
        address: 'Test Addr',
        city: 'Mumbai',
        zip_code: '400001',
        status: 'active'
    },
    ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 2,
        gr_no: `GR-2026-000${i + 2}`,
        name: `Student ${i + 2}`,
        father_name: 'Father',
        surname: 'Surname',
        mobile: '0000000000',
        dob: '2010-01-01',
        address: 'Addr',
        city: 'City',
        zip_code: '000000',
        status: 'active'
    }))
];

describe('StudentsPage with Real Table', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
        (api.getStudents as jest.Mock).mockResolvedValue({
            items: mockStudents.slice(0, 12),
            total: mockStudents.length
        });
    });

    it('renders the students directory heading', async () => {
        render(<StudentsPage />);
        expect(await screen.findByText(/student directory/i)).toBeInTheDocument();
    });

    it('fetches and displays students in the real table', async () => {
        render(<StudentsPage />);

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalled();
            expect(screen.getByText(/John/)).toBeInTheDocument();
            expect(screen.getByText('GR-2026-0001')).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('filters students when searching', async () => {
        render(<StudentsPage />);

        const searchInput = await screen.findByPlaceholderText(/search by name/i);
        fireEvent.change(searchInput, { target: { value: 'John' } });

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                search: 'John'
            }));
        }, { timeout: 2000 });
    });

    it('sorts students when sort option select is changed', async () => {
        render(<StudentsPage />);

        const sortSelect = await screen.findByRole('combobox');
        fireEvent.change(sortSelect, { target: { value: 'city' } });

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                sort_by: 'city'
            }));
        }, { timeout: 2000 });
    });

    it('sorts students when table header is clicked', async () => {
        render(<StudentsPage />);

        // Wait for table to load
        await screen.findByText(/John/);

        // Match the header text case-insensitively
        const nameHeader = screen.getByText(/Student Name/i);
        fireEvent.click(nameHeader);

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                sort_by: 'name'
            }));
        }, { timeout: 2000 });
    });

    it('handles pagination: next page', async () => {
        render(<StudentsPage />);

        await screen.findByText(/John/);

        const nextIcon = await screen.findByTestId('chevron-right-icon');
        const nextBtn = nextIcon.closest('button');

        if (nextBtn) {
            fireEvent.click(nextBtn);
            await waitFor(() => {
                expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                    skip: 12
                }));
            }, { timeout: 2000 });
        }
    });

    it('handles pagination: specific page button', async () => {
        render(<StudentsPage />);

        await screen.findByText(/John/);

        const page2Btn = await screen.findByText('02');
        fireEvent.click(page2Btn);

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                skip: 12
            }));
        }, { timeout: 2000 });
    });

    it('toggles sort order via the order button', async () => {
        render(<StudentsPage />);

        await screen.findByText(/John/);

        const buttons = await screen.findAllByRole('button');
        const sortOrderBtn = buttons.find(b =>
            within(b).queryByTestId('arrow-up-icon') ||
            within(b).queryByTestId('arrow-down-icon')
        );

        if (sortOrderBtn) {
            fireEvent.click(sortOrderBtn);
            await waitFor(() => {
                expect(api.getStudents).toHaveBeenCalledWith(expect.objectContaining({
                    order: 'desc'
                }));
            }, { timeout: 2000 });
        }
    });
});
