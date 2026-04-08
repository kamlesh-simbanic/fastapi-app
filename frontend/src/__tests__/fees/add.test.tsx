import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AddFeePage from '@/app/(dashboard)/fees/add/page';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/lib/api', () => ({
    api: {
        getStudents: jest.fn(),
        getSuggestedFee: jest.fn(),
        addPayment: jest.fn(),
    }
}));

jest.mock('@/lib/utils', () => ({
    cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
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
    CheckCircle2: () => <div data-testid="check-icon" />,
    User: () => <div data-testid="user-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    Hash: () => <div data-testid="hash-icon" />,
    Save: () => <div data-testid="save-icon" />,
    DollarSign: () => <div data-testid="dollar-icon" />,
    Info: () => <div data-testid="info-icon" />,
}));

const mockStudent = {
    id: 1,
    gr_no: 'GR1001',
    name: 'John',
    surname: 'Doe',
    father_name: 'Senior',
    mobile: '1234567890',
    school_class: { id: 1, standard: '10th', division: 'A' }
};

const mockSuggestion = {
    fee_amount: 3000,
    already_paid: 2000,
    remaining_balance: 1000
};

describe('AddFeePage (Payment Workflow)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
            loading: false
        });
        (api.getStudents as jest.Mock).mockResolvedValue({ items: [mockStudent], total: 1 });
        (api.getSuggestedFee as jest.Mock).mockResolvedValue(mockSuggestion);
        (api.addPayment as jest.Mock).mockResolvedValue({ id: 123 });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the payment recording heading', async () => {
        render(<AddFeePage />);
        expect(await screen.findByText(/record fee payment/i)).toBeInTheDocument();
    });

    it('searches and selects a student', async () => {
        render(<AddFeePage />);

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        fireEvent.change(searchInput, { target: { value: 'John' } });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(api.getStudents).toHaveBeenCalled();
            expect(screen.getByText(/John.*Doe/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/John.*Doe/i));

        await waitFor(() => {
            expect(api.getSuggestedFee).toHaveBeenCalled();
            // In the form, the value "3000" should appear in the amount field
            expect(screen.getByDisplayValue('3000')).toBeInTheDocument();
        });
    });

    it('fills form and records payment successfully', async () => {
        render(<AddFeePage />);

        // Search and Select
        fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: 'John' } });
        act(() => { jest.advanceTimersByTime(300); });
        await screen.findByText(/John.*Doe/i);
        fireEvent.click(screen.getByText(/John.*Doe/i));

        // Wait for suggestion to populate
        await waitFor(() => expect(screen.getByDisplayValue('3000')).toBeInTheDocument());

        // Fill form
        const methodSelect = screen.getByDisplayValue(/cash/i);
        fireEvent.change(methodSelect, { target: { value: 'online' } });

        const detailsInput = screen.getByPlaceholderText(/transaction ID/i);
        fireEvent.change(detailsInput, { target: { value: 'TXN777' } });

        const submitBtn = screen.getByRole('button', { name: /confirm payment/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.addPayment).toHaveBeenCalledWith(expect.objectContaining({
                gr_no: 'GR1001',
                amount: 3000,
                payment_method: 'online',
                payment_details: 'TXN777'
            }));
            expect(screen.getByText(/payment recorded/i)).toBeInTheDocument();
        });
    });

    it('validates amount before submission', async () => {
        render(<AddFeePage />);

        // Search and Select
        fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: 'John' } });
        act(() => { jest.advanceTimersByTime(300); });
        await screen.findByText(/John.*Doe/i);
        fireEvent.click(screen.getByText(/John.*Doe/i));

        await waitFor(() => expect(screen.getByDisplayValue('3000')).toBeInTheDocument());

        // Fill invalid amount (0)
        const amountInput = screen.getByDisplayValue('3000');
        fireEvent.change(amountInput, { target: { value: '0' } });

        const submitBtn = screen.getByRole('button', { name: /confirm payment/i });
        fireEvent.click(submitBtn);

        // Should show error and not call api
        await waitFor(() => {
            expect(screen.getByText(/valid amount is required/i)).toBeInTheDocument();
        });
        expect(api.addPayment).not.toHaveBeenCalled();
    });
});
