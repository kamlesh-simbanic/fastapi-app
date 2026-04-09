import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import FeesPage from '@/app/(dashboard)/fees/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Comprehensive Lucide mock
jest.mock('lucide-react', () => ({
    CreditCard: () => <div data-testid="card-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    X: () => <div data-testid="x-icon" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
    ChevronDown: () => <div data-testid="chevron-down-icon" />,
    ChevronLeft: () => <div data-testid="chevron-left-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    ArrowUp: () => <div data-testid="arrow-up-icon" />,
    ArrowDown: () => <div data-testid="arrow-down-icon" />,
    ArrowUpDown: () => <div data-testid="arrow-up-down-icon" />,
    Search: () => <div data-testid="search-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    Download: () => <div data-testid="download-icon" />,
    Printer: () => <div data-testid="print-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
}));

const mockPayments = [
    {
        id: 1,
        gr_no: 'GR1001',
        amount: 5000,
        term: 'summer',
        year: 2025,
        payment_method: 'upi',
        payment_details: 'TXN123',
        created_at: '2025-04-08T10:00:00Z',
        student: { id: 1, name: 'John', father_name: 'Senior', surname: 'Doe', mobile: '123' }
    },
    {
        id: 2,
        gr_no: 'GR1002',
        amount: 3000,
        term: 'winter',
        year: 2025,
        payment_method: 'cash',
        payment_details: null,
        created_at: '2025-04-08T11:00:00Z',
        student: { id: 2, name: 'Jane', father_name: 'Mr.', surname: 'Smith', mobile: '456' }
    }
];

describe('FeesPage (Payment Ledger)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
            loading: false
        });
        (api.getPayments as jest.Mock).mockResolvedValue(mockPayments);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const findTable = () => screen.findByRole('table');

    it('renders the payment ledger heading', async () => {
        render(<FeesPage />);
        act(() => {
            jest.advanceTimersByTime(400);
        });
        expect(await screen.findByText(/fee management/i)).toBeInTheDocument();
    });

    it('displays payments in the table', async () => {
        render(<FeesPage />);
        act(() => {
            jest.advanceTimersByTime(400);
        });

        const table = await findTable();
        await waitFor(() => {
            expect(within(table).getByText(/John.*Doe/i)).toBeInTheDocument();
            expect(within(table).getByText(/Jane.*Smith/i)).toBeInTheDocument();
            expect(within(table).getByText(/GR.*1001/i)).toBeInTheDocument();
            expect(within(table).getByText(/5,000/)).toBeInTheDocument();
        });
    });

    it('filters payments by term', async () => {
        render(<FeesPage />);
        act(() => {
            jest.advanceTimersByTime(400);
        });

        await screen.findByText(/fee management/i);
        const termSelect = await screen.findByDisplayValue(/all terms/i);
        fireEvent.change(termSelect, { target: { value: 'summer' } });

        act(() => {
            jest.advanceTimersByTime(400);
        });

        await waitFor(() => {
            expect(api.getPayments).toHaveBeenCalledWith(expect.objectContaining({
                term: 'summer'
            }));
        });
    });

    it('opens receipt modal', async () => {
        render(<FeesPage />);
        act(() => {
            jest.advanceTimersByTime(400);
        });

        const table = await findTable();
        const viewButtons = within(table).getAllByTestId('eye-icon');
        fireEvent.click(viewButtons[0]);

        const modal = await screen.findByText(/payment receipt/i).then(t => t.closest('.fixed'));
        expect(modal).toBeInTheDocument();

        if (modal) {
            expect(within(modal as HTMLElement).getByText(/John.*Doe/i)).toBeInTheDocument();
            expect(within(modal as HTMLElement).getByText('TXN123')).toBeInTheDocument();
            expect(within(modal as HTMLElement).getByText(/5,000/)).toBeInTheDocument();
        }
    });
});
