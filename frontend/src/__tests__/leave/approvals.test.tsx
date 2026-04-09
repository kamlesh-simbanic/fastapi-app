import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApprovalsPage from '@/app/(dashboard)/leave/approvals/page';
import { api } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
    api: {
        getLeaveRequests: jest.fn(),
        updateLeaveRequestStatus: jest.fn()
    }
}));

// Mock Auth - Use static mock to avoid undefined user
jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 1, name: 'Mgmt User' } })
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Loader2: ({ className }: { className?: string }) => <span data-testid="loader-icon" className={className} />,
    CheckCircle2: () => <span data-testid="success-icon" />,
    AlertCircle: () => <span data-testid="error-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    ArrowLeft: () => <span data-testid="back-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Filter: () => <span data-testid="filter-icon" />,
    User: () => <span data-testid="user-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    XCircle: () => <span data-testid="reject-icon" />,
    ChevronRight: () => <span data-testid="chevron-icon" />
}));

// Mock Table
interface TableMockProps {
    data: { id: string | number; status: string }[];
    columns: { key: string; render?: (item: any) => React.ReactNode }[];
}

jest.mock('@/components/Table', () => ({
    __esModule: true,
    default: ({ data, columns }: TableMockProps) => (
        <div data-testid="mock-table">
            {data.map((item) => (
                <div key={item.id} data-testid={`row-${item.id}`}>
                    {columns.map((col) => (
                        <div key={col.key}>{col.render ? col.render(item) : (item as any)[col.key]}</div>
                    ))}
                </div>
            ))}
        </div>
    )
}));

describe('ApprovalsPage', () => {
    const mockApprovals = [
        {
            id: 1,
            staff_id: 101,
            staff: { name: 'John Teacher', department: 'Teaching' },
            leave_type: 'sick',
            start_date: '2026-05-01',
            end_date: '2026-05-02',
            reason: 'Flu',
            status: 'pending'
        },
        {
            id: 2,
            staff_id: 102,
            staff: { name: 'Jane Admin', department: 'Admin' },
            leave_type: 'personal',
            start_date: '2026-06-01',
            end_date: '2026-06-02',
            reason: 'Wedding',
            status: 'approved'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (api.getLeaveRequests as jest.Mock).mockResolvedValue(mockApprovals);
    });

    it('renders the approvals list', async () => {
        render(<ApprovalsPage />);
        await screen.findByText('John Teacher');
        // Jane Admin is approved, so she won't show in the default 'pending' tab
        expect(screen.queryByText('Jane Admin')).not.toBeInTheDocument();
    });

    it('filters requests by search', async () => {
        render(<ApprovalsPage />);
        await screen.findByText('John Teacher');

        const searchInput = screen.getByPlaceholderText(/search namesake/i);
        fireEvent.change(searchInput, { target: { value: 'John' } });

        expect(screen.getByText('John Teacher')).toBeInTheDocument();
        expect(screen.queryByText('Jane Admin')).not.toBeInTheDocument();
    });

    it('approves a request', async () => {
        render(<ApprovalsPage />);
        await screen.findByText('John Teacher');

        // Find the pending row
        const row = screen.getByTestId('row-1');
        const approveBtn = row.querySelector('button.bg-emerald-500');

        (api.updateLeaveRequestStatus as jest.Mock).mockResolvedValue({ id: 1, status: 'approved' });
        if (approveBtn) fireEvent.click(approveBtn);

        expect(await screen.findByText(/request approved successfully/i)).toBeInTheDocument();
        expect(api.updateLeaveRequestStatus).toHaveBeenCalledWith(1, { status: 'approved' });
    });

    it('rejects a request', async () => {
        render(<ApprovalsPage />);
        await screen.findByText('John Teacher');

        const row = screen.getByTestId('row-1');
        const rejectBtn = row.querySelector('button.text-red-500');

        (api.updateLeaveRequestStatus as jest.Mock).mockResolvedValue({ id: 1, status: 'rejected' });
        if (rejectBtn) fireEvent.click(rejectBtn);

        expect(await screen.findByText(/request rejected successfully/i)).toBeInTheDocument();
        expect(api.updateLeaveRequestStatus).toHaveBeenCalledWith(1, { status: 'rejected' });
    });
});
