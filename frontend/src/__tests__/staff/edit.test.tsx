import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import EditStaffPage from '@/app/(dashboard)/staff/edit/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/lib/api', () => ({
    api: {
        getStaffById: jest.fn(),
        updateStaff: jest.fn(),
        deleteStaff: jest.fn(),
    }
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
    useSearchParams: () => ({
        get: (key: string) => (key === 'id' ? '123' : null),
    }),
}));

// Mock CalendarPicker
jest.mock('@/components/CalendarPicker', () => {
    return function CalendarPickerMock({ value, onChange, label }: { value: string, onChange: (d: string) => void, label: string }) {
        return (
            <div data-testid="calendar-picker">
                <label>{label}</label>
                <input
                    name="dob"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ChevronLeft: () => <div data-testid="back-icon" />,
    Save: () => <div data-testid="save-icon" />,
    User: () => <div data-testid="user-icon" />,
    Mail: () => <div data-testid="mail-icon" />,
    Phone: () => <div data-testid="phone-icon" />,
    Briefcase: () => <div data-testid="briefcase-icon" />,
    MapPin: () => <div data-testid="map-icon" />,
    GraduationCap: () => <div data-testid="grad-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
    Trash2: () => <div data-testid="trash-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
}));

jest.mock('@/lib/utils', () => ({
    cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
}));

const mockStaffData = {
    id: 123,
    name: 'Existing Staff',
    email: 'existing@test.com',
    mobile: '1234567890',
    dob: '1985-10-10',
    department: 'teaching',
    qualification: 'Ph.D.',
    address: 'Old Address',
    city: 'Old City',
    zip_code: '111111',
    leave_balance: 15,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
};

describe('EditStaffPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
        (api.getStaffById as jest.Mock).mockResolvedValue(mockStaffData);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('fetches and displays staff details for editing', async () => {
        render(<EditStaffPage />);

        await waitFor(() => {
            expect(api.getStaffById).toHaveBeenCalledWith('123');
        });

        expect(await screen.findByDisplayValue('Existing Staff')).toBeInTheDocument();
        expect(screen.getByDisplayValue('existing@test.com')).toBeInTheDocument();
        // The display value of a select is the label of the selected option
        expect(screen.getByDisplayValue('Teaching')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Ph.D. - Doctor of Philosophy')).toBeInTheDocument();
    });

    it('successfully updates staff profile', async () => {
        (api.updateStaff as jest.Mock).mockResolvedValue({ ...mockStaffData, name: 'Updated Staff' });

        render(<EditStaffPage />);

        // Wait for data to load
        await screen.findByDisplayValue('Existing Staff');

        // Update name
        fireEvent.change(screen.getByDisplayValue('Existing Staff'), { target: { value: 'Updated Staff' } });

        const saveBtn = screen.getByRole('button', { name: /update staff profile/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(api.updateStaff).toHaveBeenCalledWith('123', expect.objectContaining({
                name: 'Updated Staff'
            }));
        });

        expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/staff');
        });
    });

    it('deletes staff member after confirmation', async () => {
        window.confirm = jest.fn().mockReturnValue(true);
        (api.deleteStaff as jest.Mock).mockResolvedValue({ message: 'Deleted' });

        render(<EditStaffPage />);

        await screen.findByDisplayValue('Existing Staff');

        const deleteBtn = screen.getByTitle(/delete staff member/i);
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(api.deleteStaff).toHaveBeenCalledWith('123');
            expect(mockPush).toHaveBeenCalledWith('/staff');
        });
    });
});
