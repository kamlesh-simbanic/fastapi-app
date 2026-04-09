import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import FeeStructurePage from '@/app/(dashboard)/fee-structure/page';
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
    Edit2: () => <div data-testid="edit-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
}));

const mockClasses = [
    { id: 1, standard: '10th', division: 'A' },
    { id: 2, standard: '10th', division: 'B' },
];

const mockStructures = [
    {
        id: 1,
        class_id: 1,
        year: 2025,
        fee_amount: 1500,
        school_class: { standard: '10th', division: 'A' },
        created_by: { name: 'Admin' }
    },
    {
        id: 2,
        class_id: 2,
        year: 2025,
        fee_amount: 2000,
        school_class: { standard: '10th', division: 'B' },
        created_by: { name: 'Admin' }
    },
];

describe('FeeStructurePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
            loading: false
        });
        (api.getClasses as jest.Mock).mockResolvedValue({
            items: mockClasses,
            total: 2
        });
        (api.getFeeStructures as jest.Mock).mockResolvedValue(mockStructures);
    });

    const getTable = () => screen.getByRole('table');

    it('renders the fee structure heading', async () => {
        render(<FeeStructurePage />);
        expect(await screen.findByRole('heading', { name: /fee structure/i })).toBeInTheDocument();
    });

    it('displays fee structures in the table', async () => {
        render(<FeeStructurePage />);

        await waitFor(() => {
            const table = getTable();
            expect(within(table).getByText(/10th.*A/i)).toBeInTheDocument();
            expect(within(table).getByText(/\$1,500/)).toBeInTheDocument();
        });
    });

    it('filters fee structures by search', async () => {
        render(<FeeStructurePage />);

        await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/search class/i);
        // Search for 'A' which should only match '10th - A'
        fireEvent.change(searchInput, { target: { value: 'A' } });

        await waitFor(() => {
            const table = getTable();
            expect(within(table).getByText(/10th.*A/i)).toBeInTheDocument();
            expect(within(table).queryByText(/10th.*B/i)).not.toBeInTheDocument();
        });
    });

    it('opens modal and adds a new fee structure', async () => {
        (api.addFeeStructure as jest.Mock).mockResolvedValue({ id: 3 });

        render(<FeeStructurePage />);

        const addBtn = await screen.findByRole('button', { name: /new fee structure/i });
        fireEvent.click(addBtn);

        const modal = await screen.findByRole('heading', { name: /new fee structure/i }).then(h => h.closest('.fixed'));
        expect(modal).toBeInTheDocument();

        if (modal) {
            const classSelect = within(modal as HTMLElement).getByDisplayValue(/choose class/i);
            const amountInput = within(modal as HTMLElement).getByPlaceholderText('0.00');

            fireEvent.change(classSelect, { target: { value: '1' } });
            fireEvent.change(amountInput, { target: { value: '3000' } });

            const submitBtn = within(modal as HTMLElement).getByRole('button', { name: /create structure/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(api.addFeeStructure).toHaveBeenCalledWith(expect.objectContaining({
                    class_id: 1,
                    fee_amount: 3000
                }));
            });
        }
    });

    it('handles fee structure deletion', async () => {
        window.confirm = jest.fn().mockReturnValue(true);
        render(<FeeStructurePage />);

        await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

        const table = getTable();
        const row = within(table).getByText(/10th.*A/i).closest('tr');
        if (row) {
            const deleteBtn = within(row).getByTestId('trash-icon');
            fireEvent.click(deleteBtn);
        }

        await waitFor(() => {
            expect(api.deleteFeeStructure).toHaveBeenCalledWith(1);
        });
    });
});
