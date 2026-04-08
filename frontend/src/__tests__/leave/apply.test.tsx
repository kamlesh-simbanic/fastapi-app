import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LeaveManagementPage from '@/app/(dashboard)/leave/page';
import { api } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
    api: {
        getLeaveRequests: jest.fn(),
        addLeaveRequest: jest.fn()
    }
}));

// Mock CalendarPicker
interface CalendarPickerProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
}

jest.mock('@/components/CalendarPicker', () => ({
    __esModule: true,
    default: ({ label, value, onChange }: CalendarPickerProps) => (
        <div data-testid={`calendar-${label.toLowerCase().replace(' ', '-')}`}>
            <label>{label}</label>
            <input
                data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Loader2: () => <span data-testid="loader-icon" />,
    CheckCircle2: () => <span data-testid="success-icon" />,
    AlertCircle: () => <span data-testid="error-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    ChevronRight: () => <span data-testid="chevron-icon" />,
    LayoutGrid: () => <span data-testid="grid-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    ArrowLeft: () => <span data-testid="back-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Filter: () => <span data-testid="filter-icon" />
}));

// Mock Table
interface TableMockProps {
    data: { id: string | number }[];
    columns: { key: string; render?: (item: any) => React.ReactNode }[];
}

jest.mock('@/components/Table', () => ({
    __esModule: true,
    default: ({ data, columns }: TableMockProps) => (
        <div data-testid="mock-table">
            {data.map((item) => (
                <div key={item.id}>
                    {columns.map((col) => (
                        <div key={col.key}>{col.render ? col.render(item) : (item as any)[col.key]}</div>
                    ))}
                </div>
            ))}
        </div>
    )
}));

describe('LeaveManagementPage', () => {
    const mockLeaveRequests = [
        {
            id: 1,
            leave_type: 'sick',
            start_date: '2026-05-01',
            end_date: '2026-05-02',
            reason: 'Flu',
            status: 'approved'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (api.getLeaveRequests as jest.Mock).mockResolvedValue(mockLeaveRequests);
    });

    it('renders leave history by default', async () => {
        render(<LeaveManagementPage />);
        await screen.findByText(/Flu/i);
        expect(screen.getByText(/balance summary/i)).toBeInTheDocument();
    });

    it('opens and submits the leave application form', async () => {
        render(<LeaveManagementPage />);
        await screen.findByText(/Flu/i);

        // Click Apply for Leave
        const applyBtn = screen.getByRole('button', { name: /apply for leave/i });
        fireEvent.click(applyBtn);

        expect(screen.getByText(/new leave request/i)).toBeInTheDocument();

        // Fill form
        const reasonInput = screen.getByPlaceholderText(/detailed reason/i);
        fireEvent.change(reasonInput, { target: { value: 'Personal work' } });

        const startDateInput = screen.getByTestId('input-start-date');
        fireEvent.change(startDateInput, { target: { value: '2026-06-01' } });

        const endDateInput = screen.getByTestId('input-end-date');
        fireEvent.change(endDateInput, { target: { value: '2026-06-02' } });

        // Submit
        (api.addLeaveRequest as jest.Mock).mockResolvedValue({ id: 2 });
        const submitBtn = screen.getByRole('button', { name: /submit application/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/submitted successfully/i)).toBeInTheDocument();
        expect(api.addLeaveRequest).toHaveBeenCalledWith({
            leave_type: 'casual',
            start_date: '2026-06-01',
            end_date: '2026-06-02',
            reason: 'Personal work'
        });
    });

    it('shows error if dates are missing', async () => {
        render(<LeaveManagementPage />);
        // Wait for data to load
        await screen.findByText(/Flu/i);

        fireEvent.click(screen.getByRole('button', { name: /apply for leave/i }));

        // Fill reason but leave dates empty
        const reasonInput = screen.getByPlaceholderText(/detailed reason/i);
        fireEvent.change(reasonInput, { target: { value: 'Something' } });

        const submitBtn = screen.getByRole('button', { name: /submit application/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/select both start and end dates/i)).toBeInTheDocument();
    });
});
