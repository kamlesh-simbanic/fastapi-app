import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendancePage from '@/app/(dashboard)/attendance/page';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/lib/api', () => ({
    api: {
        getClasses: jest.fn(),
        getStudentsByClass: jest.fn(),
        getAttendance: jest.fn(),
        submitAttendance: jest.fn(),
    }
}));

// Mock CalendarPicker
jest.mock('@/components/CalendarPicker', () => {
    return function MockCalendarPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
        return (
            <div data-testid="calendar-picker">
                <label htmlFor="date-input">{label}</label>
                <input
                    id="date-input"
                    data-testid="date-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Save: () => <span data-testid="save-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    CheckCircle2: () => <span data-testid="check-icon" />,
    AlertCircle: () => <span data-testid="alert-icon" />,
    ClipboardCheck: () => <span data-testid="clipboard-icon" />,
    FileText: () => <span data-testid="file-text-icon" />,
    Users: () => <span data-testid="users-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    XCircle: () => <span data-testid="x-circle-icon" />,
}));

const mockClasses = {
    items: [
        { id: 1, standard: '10', division: 'A' },
        { id: 2, standard: '10', division: 'B' },
    ],
    total: 2
};

const mockStudents = [
    { id: 101, name: 'John', father_name: 'F', surname: 'Doe', gr_no: 'GR101' },
    { id: 102, name: 'Jane', father_name: 'F', surname: 'Smith', gr_no: 'GR102' },
];

describe('AttendancePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Teacher', email: 'teacher@test.com' }
        });
        (api.getClasses as jest.Mock).mockResolvedValue(mockClasses);
        (api.getStudentsByClass as jest.Mock).mockResolvedValue(mockStudents);
        (api.getAttendance as jest.Mock).mockResolvedValue([]);
    });

    it('renders and loads classes', async () => {
        render(<AttendancePage />);
        await waitFor(() => {
            expect(api.getClasses).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(screen.getByText('Standard 10 - A')).toBeInTheDocument();
        });
        expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument();
    });

    it('loads students when a class is selected', async () => {
        render(<AttendancePage />);

        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });

        await waitFor(() => {
            expect(api.getStudentsByClass).toHaveBeenCalledWith('1');
        });

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('toggles student attendance status', async () => {
        render(<AttendancePage />);

        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });

        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        // Default is Present (P)
        const absentBtn = screen.getAllByRole('button', { name: /absent/i })[0]; // First student (John)

        fireEvent.click(absentBtn);
    });

    it('marks all as present or absent', async () => {
        render(<AttendancePage />);

        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        const markAllAbsent = screen.getByText(/mark all absent/i);
        fireEvent.click(markAllAbsent);

        // Submit and verify payload
        const submitBtn = screen.getByRole('button', { name: /submit attendance/i });
        (api.submitAttendance as jest.Mock).mockResolvedValue({ message: 'Success' });

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.submitAttendance).toHaveBeenCalledWith(expect.objectContaining({
                records: [
                    { student_id: 101, status: 'A' },
                    { student_id: 102, status: 'A' }
                ]
            }));
        });
    });

    it('handles successful submission', async () => {
        (api.submitAttendance as jest.Mock).mockResolvedValue({ message: 'Success' });
        window.scrollTo = jest.fn();

        render(<AttendancePage />);

        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });

        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /submit attendance/i }));

        await waitFor(() => {
            expect(screen.getByText(/attendance recorded successfully/i)).toBeInTheDocument();
        });
    });
});
