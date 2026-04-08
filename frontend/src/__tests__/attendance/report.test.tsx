import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendanceReportPage from '@/app/(dashboard)/attendance/report/page';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('next/navigation', () => ({
    useRouter: () => ({ back: jest.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/lib/api', () => ({
    api: {
        getClasses: jest.fn(),
        getMonthlyReport: jest.fn(),
        getMonthlyReportPDF: jest.fn(),
    }
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Calendar: () => <span data-testid="calendar-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    FileText: () => <span data-testid="file-text-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    ChevronLeft: () => <span data-testid="chevron-left-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Download: () => <span data-testid="download-icon" />,
    TrendingUp: () => <span data-testid="trending-up-icon" />,
    TrendingDown: () => <span data-testid="trending-down-icon" />,
    Activity: () => <span data-testid="activity-icon" />,
    Users2: () => <span data-testid="users2-icon" />,
    AlertCircle: () => <span data-testid="alert-icon" />,
}));

// Mock jsPDF
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        setTextColor: jest.fn(),
        text: jest.fn(),
        save: jest.fn(),
    }));
});
jest.mock('jspdf-autotable', () => jest.fn());

const mockClasses = {
    items: [
        { id: 1, standard: '10', division: 'A' },
    ],
    total: 1
};

const mockReport = [
    {
        student_id: 101,
        name: 'John',
        surname: 'Doe',
        gr_no: 'GR101',
        total_days: 20,
        present_days: 18,
        absent_days: 2,
        attendance_percentage: 90.0,
        data: { '1': 'present', '2': 'absent' }
    }
];

describe('AttendanceReportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Teacher', email: 'teacher@test.com' }
        });
        (api.getClasses as jest.Mock).mockResolvedValue(mockClasses);
        (api.getMonthlyReport as jest.Mock).mockResolvedValue(mockReport);
    });

    it('renders selection controls and loads classes', async () => {
        render(<AttendanceReportPage />);
        await waitFor(() => expect(api.getClasses).toHaveBeenCalled());

        expect(screen.getByRole('combobox', { name: /select month/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /select year/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument();
    });

    it('generates report when a class is selected', async () => {
        render(<AttendanceReportPage />);

        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });

        await waitFor(() => {
            expect(api.getMonthlyReport).toHaveBeenCalledWith(expect.objectContaining({
                class_id: 1,
            }));
        });

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getAllByText('90.0%')[0]).toBeInTheDocument();
    });

    it('filters report by student name', async () => {
        render(<AttendanceReportPage />);
        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());
        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });

        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/search by student name/i);
        fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText(/no attendance data found/i)).toBeInTheDocument();
    });

    it('handles frontend PDF export', async () => {
        render(<AttendanceReportPage />);
        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());
        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });
        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        const exportBtn = screen.getByRole('button', { name: /export pdf \(client\)/i });
        fireEvent.click(exportBtn);

        const jsPDFMock = jest.requireMock('jspdf');
        expect(jsPDFMock).toHaveBeenCalled();
    });

    it('handles backend PDF export', async () => {
        const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
        (api.getMonthlyReportPDF as jest.Mock).mockResolvedValue(mockBlob);

        window.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
        window.URL.revokeObjectURL = jest.fn();

        render(<AttendanceReportPage />);
        await waitFor(() => expect(screen.getByRole('combobox', { name: /select class/i })).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Standard 10 - A')).toBeInTheDocument());
        fireEvent.change(screen.getByRole('combobox', { name: /select class/i }), { target: { value: '1' } });
        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        const exportBtn = screen.getByRole('button', { name: /export pdf \(server\)/i });
        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(api.getMonthlyReportPDF).toHaveBeenCalled();
            expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        });
    });
});
