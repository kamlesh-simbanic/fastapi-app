import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CalendarPicker from '@/components/CalendarPicker';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
    api: {
        getHolidays: jest.fn(),
    },
}));

describe('CalendarPicker Component', () => {
    const mockOnChange = jest.fn();
    const mockHolidays = [
        { id: 1, name: 'New Year', date: '2026-01-01', number_of_days: 1 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (api.getHolidays as jest.Mock).mockResolvedValue(mockHolidays);
    });

    it('renders with label and placeholder', () => {
        render(<CalendarPicker onChange={mockOnChange} label="Select Date" placeholder="Choose a date" />);

        expect(screen.getByText('Select Date')).toBeInTheDocument();
        expect(screen.getByText('Choose a date')).toBeInTheDocument();
    });

    it('opens the calendar popover when clicked', () => {
        render(<CalendarPicker onChange={mockOnChange} />);

        const trigger = screen.getByRole('button');
        fireEvent.click(trigger);

        // Find by role combobox
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
    });

    it('calls onChange when a date is selected', () => {
        const initialDate = '2026-04-01';
        render(<CalendarPicker value={initialDate} onChange={mockOnChange} />);

        const trigger = screen.getByRole('button');
        fireEvent.click(trigger);

        const day15 = screen.getByText('15');
        fireEvent.click(day15);

        expect(mockOnChange).toHaveBeenCalledWith('2026-04-15', false);
    });

    it('navigates to next month when clicking chevron', () => {
        const initialDate = '2026-04-01';
        render(<CalendarPicker value={initialDate} onChange={mockOnChange} />);

        fireEvent.click(screen.getByRole('button'));

        // Find the next button by testing all buttons for the chevron icon
        // Or simpler: the next month button is the one with changeMonth(1)
        // In the popover, it's usually the only button that is NOT a day button.
        const buttons = screen.getAllByRole('button');
        // Filter out buttons with numbers (days) and the main trigger button
        const nextButton = buttons.find(b => b.querySelector('.lucide-chevron-right'));

        if (nextButton) {
            fireEvent.click(nextButton);
        } else {
            // Fallback to index if needed, but let's try icon first
            const popoverButtons = buttons.filter(b => !b.textContent || isNaN(parseInt(b.textContent)));
            fireEvent.click(popoverButtons[popoverButtons.length - 1]);
        }

        const selectors = screen.getAllByRole('combobox');
        const monthSelect = selectors[0] as HTMLSelectElement;
        expect(monthSelect.value).toBe('4'); // May is index 4
    });

    it('displays error message when provided', () => {
        const errorMsg = 'Date is required';
        render(<CalendarPicker onChange={mockOnChange} error={errorMsg} />);

        expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });

    it('fetches and highlights holidays if enabled', async () => {
        render(<CalendarPicker onChange={mockOnChange} value="2026-01-15" disableHolidays={true} />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(api.getHolidays).toHaveBeenCalled();
        });

        const day1 = screen.getByText('1');
        expect(day1.closest('button')).toHaveClass('text-pink-600');
    });

    it('disables dates based on shouldDisableDate prop', () => {
        const shouldDisableDate = (d: Date) => d.getDate() === 10;
        render(<CalendarPicker onChange={mockOnChange} value="2026-04-01" shouldDisableDate={shouldDisableDate} />);

        fireEvent.click(screen.getByRole('button'));

        const day10 = screen.getByText('10').closest('button');
        expect(day10).toBeDisabled();
    });
});
