import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AddStaffPage from '@/app/(dashboard)/staff/add/page';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/lib/api', () => ({
    api: {
        addStaff: jest.fn(),
    }
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
    }),
}));

// Mock CalendarPicker to simplify date selection in tests
jest.mock('@/components/CalendarPicker', () => {
    return function CalendarPickerMock({ value, onChange, label, error }: any) {
        return (
            <div data-testid="calendar-picker">
                <label>{label}</label>
                <input
                    name="dob"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="YYYY-MM-DD"
                />
                {error && <span>{error}</span>}
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
}));

jest.mock('@/lib/utils', () => ({
    cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
}));

describe('AddStaffPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the add staff heading', () => {
        render(<AddStaffPage />);
        expect(screen.getByText(/add new staff/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<AddStaffPage />);

        const submitBtn = screen.getByRole('button', { name: /create staff profile/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/mobile number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
        expect(screen.getByText(/zip code is required/i)).toBeInTheDocument();
    });

    it('successfully submits the form', async () => {
        (api.addStaff as jest.Mock).mockResolvedValue({ id: 99 });

        const { container } = render(<AddStaffPage />);

        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Jane Doe' } });
        fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'jane@test.com' } });
        fireEvent.change(container.querySelector('input[name="mobile"]')!, { target: { value: '9876543210' } });
        fireEvent.change(container.querySelector('input[name="dob"]')!, { target: { value: '1995-05-15' } });
        fireEvent.change(container.querySelector('textarea[name="address"]')!, { target: { value: '123 Test St' } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: 'StaffCity' } });
        fireEvent.change(container.querySelector('input[name="zip_code"]')!, { target: { value: '123456' } });

        const submitBtn = screen.getByRole('button', { name: /create staff profile/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.addStaff).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@test.com'
            }));
        });

        expect(await screen.findByText(/staff member added/i)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/staff');
        });
    });
});
