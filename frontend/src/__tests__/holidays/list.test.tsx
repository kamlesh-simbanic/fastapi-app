import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HolidaysPage from '@/app/(dashboard)/holidays/page';
import { useAuth } from '@/context/AuthContext';
import { useGlobalData } from '@/context/GlobalContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/context/GlobalContext');
jest.mock('@/lib/api', () => ({
    api: {
        addHoliday: jest.fn(),
        deleteHoliday: jest.fn(),
    }
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Calendar: () => <div data-testid="calendar-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    CalendarDays: () => <div data-testid="calendar-days-icon" />,
    X: () => <div data-testid="x-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    ArrowUp: () => <div data-testid="arrow-up-icon" />,
    ArrowDown: () => <div data-testid="arrow-down-icon" />,
    ChevronLeft: () => <div data-testid="chevron-left-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />,
    ArrowUpDown: () => <div data-testid="arrow-up-down-icon" />,
}));

// Mock CalendarPicker
jest.mock('@/components/CalendarPicker', () => {
    return function CalendarPickerMock({ value, onChange, label }: { value: string, onChange: (d: string) => void, label: string }) {
        return (
            <div data-testid="calendar-picker">
                <label>{label}</label>
                <input
                    name="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };
});

const mockHolidays = [
    {
        id: 1,
        name: 'Diwali Break',
        date: '2025-10-20',
        number_of_days: 5
    },
    {
        id: 2,
        name: 'Winter Vacation',
        date: '2025-12-24',
        number_of_days: 10
    }
];

describe('HolidaysPage', () => {
    const refreshHolidays = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin', department: 'admin' },
        });
        (useGlobalData as jest.Mock).mockReturnValue({
            holidays: mockHolidays,
            loading: { holidays: false },
            refreshHolidays: refreshHolidays,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the holiday schedule heading', () => {
        render(<HolidaysPage />);
        expect(screen.getByRole('heading', { level: 1, name: /school holidays/i })).toBeInTheDocument();
    });

    it('displays the list of holidays in the table', () => {
        render(<HolidaysPage />);
        expect(screen.getByText('Diwali Break')).toBeInTheDocument();
        expect(screen.getByText('Winter Vacation')).toBeInTheDocument();
        expect(screen.getByText('5 Days')).toBeInTheDocument();
    });

    it('opens the add holiday modal and submits successfully', async () => {
        (api.addHoliday as jest.Mock).mockResolvedValue({ id: 3 });

        render(<HolidaysPage />);

        const addBtn = screen.getByRole('button', { name: /add holiday/i });
        fireEvent.click(addBtn);

        expect(screen.getByText(/add new holiday/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/e.g. Diwali Break/i), { target: { value: 'New Holiday' } });
        fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '2' } });
        // Date is pre-filled, we can skip changing it unless needed

        const submitBtn = screen.getByRole('button', { name: /schedule holiday/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.addHoliday).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Holiday',
                number_of_days: 2
            }));
            expect(refreshHolidays).toHaveBeenCalled();
        });

        expect(await screen.findByText(/holiday added successfully/i)).toBeInTheDocument();
    });

    it('opens delete confirmation and deletes holiday', async () => {
        (api.deleteHoliday as jest.Mock).mockResolvedValue({ message: 'Deleted' });

        render(<HolidaysPage />);

        const deleteBtns = screen.getAllByTestId('trash-icon');
        fireEvent.click(deleteBtns[0].parentElement!); // Click the button containing the trash icon

        expect(screen.getByText(/delete holiday/i)).toBeInTheDocument();

        const confirmBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.deleteHoliday).toHaveBeenCalledWith(1);
            expect(refreshHolidays).toHaveBeenCalled();
        });

        expect(await screen.findByText(/holiday deleted successfully/i)).toBeInTheDocument();
    });
});
