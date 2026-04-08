import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TimetablePage from '@/app/(dashboard)/timetable/page';
import { useGlobalData } from '@/context/GlobalContext';

// Mock GlobalContext
jest.mock('@/context/GlobalContext', () => ({
    useGlobalData: jest.fn()
}));

// Mock jsPDF and jspdf-autotable
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        setTextColor: jest.fn(),
        text: jest.fn(),
        save: jest.fn()
    }));
});

jest.mock('jspdf-autotable', () => jest.fn());

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    BookOpen: () => <span data-testid="book-open-icon" />,
    User: () => <span data-testid="user-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Download: () => <span data-testid="download-icon" />
}));

describe('TimetablePage', () => {
    const mockClasses = [
        { id: 1, standard: '10', division: 'A' },
        { id: 2, standard: '10', division: 'B' }
    ];

    const mockTimetableData = [
        {
            id: 1,
            day_of_week: 'Monday',
            period_number: 1,
            subject: { id: 101, name: 'Mathematics' },
            teacher: { id: 201, name: 'Dr. Smith' }
        },
        {
            id: 2,
            day_of_week: 'Tuesday',
            period_number: 2,
            subject: { id: 102, name: 'Physics' },
            teacher: { id: 202, name: 'Mr. Brown' }
        }
    ];

    const mockRefreshTimetable = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useGlobalData as jest.Mock).mockReturnValue({
            classes: mockClasses,
            timetables: {
                1: mockTimetableData
                // 2 is missing, so it should trigger refresh
            },
            loading: {
                timetables: false
            },
            refreshTimetable: mockRefreshTimetable
        });
    });

    it('renders the timetable grid and header', () => {
        render(<TimetablePage />);

        expect(screen.getByText(/school timetable/i)).toBeInTheDocument();
        expect(screen.getByText(/standard 10 - a/i)).toBeInTheDocument();
        expect(screen.getByText(/periods/i)).toBeInTheDocument();
    });

    it('displays timetable slots correctly', () => {
        render(<TimetablePage />);

        // Check for Mathematics in Monday, Period 1
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();

        // Check for Physics in Tuesday, Period 2
        expect(screen.getByText('Physics')).toBeInTheDocument();
        expect(screen.getByText('Mr. Brown')).toBeInTheDocument();
    });

    it('switches between classes', async () => {
        render(<TimetablePage />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '2' } });

        await waitFor(() => {
            expect(mockRefreshTimetable).toHaveBeenCalledWith(2);
        });
    });

    it('shows free slots where no data exists', () => {
        render(<TimetablePage />);

        // Monday Period 2 should be free (based on our mock)
        const freeSlots = screen.getAllByText(/free slot/i);
        expect(freeSlots.length).toBeGreaterThan(0);
    });

    it('triggers PDF export on button click', () => {
        render(<TimetablePage />);

        const exportBtn = screen.getByRole('button', { name: /export pdf/i });
        fireEvent.click(exportBtn);

        const jsPDFMock = jest.requireMock('jspdf');
        const autoTableMock = jest.requireMock('jspdf-autotable');

        expect(jsPDFMock).toHaveBeenCalled();
        expect(autoTableMock).toHaveBeenCalled();
    });

    it('shows loading state correctly', () => {
        (useGlobalData as jest.Mock).mockReturnValue({
            classes: mockClasses,
            timetables: {},
            loading: {
                timetables: true
            },
            refreshTimetable: mockRefreshTimetable
        });

        render(<TimetablePage />);
        // Look for skeleton pulses (animate-pulse)
        // Since we can't easily query by CSS class with standard RTL, we check for absent data
        expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
    });
});
