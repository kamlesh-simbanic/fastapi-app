import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import StaffPage from '@/app/(dashboard)/staff/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/lib/api', () => ({
    api: {
        getStaff: jest.fn(),
    }
}));

jest.mock('@/lib/utils', () => ({
    cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock next/link
jest.mock('next/link', () => {
    return function LinkMock({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Users: () => <div data-testid="users-icon" />,
    Search: () => <div data-testid="search-icon" />,
    Filter: () => <div data-testid="filter-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    X: () => <div data-testid="x-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    ArrowUp: () => <div data-testid="arrow-up-icon" />,
    ArrowDown: () => <div data-testid="arrow-down-icon" />,
    ChevronLeft: () => <div data-testid="chevron-left-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    ArrowUpDown: () => <div data-testid="arrow-up-down-icon" />,
    Pencil: () => <div data-testid="pencil-icon" />,
    MoreVertical: () => <div data-testid="more-icon" />,
    Mail: () => <div data-testid="mail-icon" />,
    Phone: () => <div data-testid="phone-icon" />,
    MapPin: () => <div data-testid="map-icon" />,
}));

const mockStaff = [
    {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@test.com',
        mobile: '1112223333',
        department: 'teaching',
        qualification: 'Master of Education',
        city: 'TeacherTown',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z'
    },
    {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@test.com',
        mobile: '4445556666',
        department: 'admin',
        qualification: 'MBA',
        city: 'AdminCity',
        created_at: '2025-01-02T10:00:00Z',
        updated_at: '2025-01-02T10:00:00Z'
    }
];

describe('StaffPage (Directory Listing)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
        (api.getStaff as jest.Mock).mockResolvedValue({
            items: mockStaff,
            total: 2
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the staff directory heading', async () => {
        render(<StaffPage />);
        expect(await screen.findByText(/staff directory/i)).toBeInTheDocument();
    });

    it('fetches and displays staff in the table', async () => {
        render(<StaffPage />);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(api.getStaff).toHaveBeenCalled();
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.getByText('bob@test.com')).toBeInTheDocument();
        });
    });

    it('searches for staff members', async () => {
        render(<StaffPage />);

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        fireEvent.change(searchInput, { target: { value: 'Alice' } });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(api.getStaff).toHaveBeenCalledWith(expect.objectContaining({
                search: 'Alice'
            }));
        });
    });

    it('filters by department', async () => {
        render(<StaffPage />);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        // "Teaching" button
        const teachingBtn = await screen.findByRole('button', { name: /teaching/i });
        fireEvent.click(teachingBtn);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(api.getStaff).toHaveBeenCalledWith(expect.objectContaining({
                department: ['teaching']
            }));
        });
    });

    it('sorts by different columns', async () => {
        render(<StaffPage />);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        // The sort select
        const sortSelect = screen.getByRole('combobox');
        fireEvent.change(sortSelect, { target: { value: 'city' } });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(api.getStaff).toHaveBeenCalledWith(expect.objectContaining({
                sort_by: 'city'
            }));
        });
    });
});
