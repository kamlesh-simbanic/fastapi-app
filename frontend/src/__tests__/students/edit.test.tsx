import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditStudentPage from '@/app/(dashboard)/students/edit/page';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/lib/api');

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams('id=1');

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
}));

// Mock next/link
jest.mock('next/link', () => {
    return function LinkMock({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ArrowLeft: function ArrowLeftMock() { return <div data-testid="arrow-left-icon" />; },
    Check: function CheckMock() { return <div data-testid="check-icon" />; },
    AlertCircle: function AlertCircleMock() { return <div data-testid="alert-circle-icon" />; },
    Loader2: function Loader2Mock() { return <div data-testid="loader-icon" />; },
    UserCircle: function UserCircleMock() { return <div data-testid="user-circle-icon" />; },
    Phone: function PhoneMock() { return <div data-testid="phone-icon" />; },
    MapPin: function MapPinMock() { return <div data-testid="map-pin-icon" />; },
    Calendar: function CalendarMock() { return <div data-testid="calendar-icon" />; },
    BadgeCheck: function BadgeCheckMock() { return <div data-testid="badge-check-icon" />; },
    ShieldCheck: function ShieldCheckMock() { return <div data-testid="shield-check-icon" />; },
    Pencil: function PencilMock() { return <div data-testid="pencil-icon" />; },
    Activity: function ActivityMock() { return <div data-testid="activity-icon" />; },
}));

const mockStudent = {
    id: 1,
    gr_no: 'GR-2026-0001',
    name: 'John',
    father_name: 'Doe',
    surname: 'Smith',
    mobile: '1234567890',
    dob: '2010-01-01',
    address: 'Old Addr',
    city: 'Mumbai',
    zip_code: '400001',
    status: 'active'
};

describe('EditStudentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
        (api.getStudentById as jest.Mock).mockResolvedValue(mockStudent);
    });

    it('fetches and populates student data on mount', async () => {
        render(<EditStudentPage />);

        expect(api.getStudentById).toHaveBeenCalledWith('1');

        expect(await screen.findByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Old Addr')).toBeInTheDocument();
        expect(screen.getByText(/GR-2026-0001/i)).toBeInTheDocument();
    });

    it('successfully updates the student record', async () => {
        (api.updateStudent as jest.Mock).mockResolvedValue({ success: true });

        render(<EditStudentPage />);

        const nameInput = await screen.findByDisplayValue('John');
        fireEvent.change(nameInput, { target: { name: 'name', value: 'Johnny' } });

        const submitBtn = screen.getByRole('button', { name: /update academic file/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.updateStudent).toHaveBeenCalledWith('1', expect.objectContaining({
                name: 'Johnny'
            }));
        });

        expect(await screen.findByText(/profile synchronized/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/students');
        }, { timeout: 2000 });
    });

    it('shows Record Not Found if API fails', async () => {
        (api.getStudentById as jest.Mock).mockRejectedValue(new Error('Not Found'));

        render(<EditStudentPage />);

        // Wait for fetching to finish and show Record Not Found
        expect(await screen.findByText(/record not found/i)).toBeInTheDocument();
    });

    it('validates fields during edit', async () => {
        render(<EditStudentPage />);

        const nameInput = await screen.findByDisplayValue('John');
        fireEvent.change(nameInput, { target: { name: 'name', value: '' } });

        const submitBtn = screen.getByRole('button', { name: /update academic file/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    });
});
