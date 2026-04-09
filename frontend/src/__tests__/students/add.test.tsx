import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AddStudentPage from '@/app/(dashboard)/students/add/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/lib/api');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock next/link
jest.mock('next/link', () => {
    return function LinkMock({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Users: function UsersMock() { return <div data-testid="users-icon" />; },
    ArrowLeft: function ArrowLeftMock() { return <div data-testid="arrow-left-icon" />; },
    Check: function CheckMock() { return <div data-testid="check-icon" />; },
    AlertCircle: function AlertCircleMock() { return <div data-testid="alert-circle-icon" />; },
    Loader2: function Loader2Mock() { return <div data-testid="loader-icon" />; },
    UserCircle: function UserCircleMock() { return <div data-testid="user-circle-icon" />; },
    Phone: function PhoneMock() { return <div data-testid="phone-icon" />; },
    MapPin: function MapPinMock() { return <div data-testid="map-pin-icon" />; },
    Calendar: function CalendarMock() { return <div data-testid="calendar-icon" />; },
    ShieldCheck: function ShieldCheckMock() { return <div data-testid="shield-check-icon" />; },
}));

describe('AddStudentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
    });

    it('renders the admission portal heading', () => {
        render(<AddStudentPage />);
        expect(screen.getByText(/admission portal/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields on submit', async () => {
        render(<AddStudentPage />);

        const submitBtn = screen.getByRole('button', { name: /confirm admission/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/father's name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/surname is required/i)).toBeInTheDocument();
        expect(screen.getByText(/mobile number is required/i)).toBeInTheDocument();
    });

    it('validates mobile number format', async () => {
        const { container } = render(<AddStudentPage />);

        const mobileInput = container.querySelector('input[name="mobile"]');
        if (mobileInput) {
            fireEvent.change(mobileInput, { target: { name: 'mobile', value: '123' } });

            const submitBtn = screen.getByRole('button', { name: /confirm admission/i });
            fireEvent.click(submitBtn);

            expect(await screen.findByText(/mobile number must be 10 digits/i)).toBeInTheDocument();
        }
    });

    it('successfully submits the form and redirects', async () => {
        (api.addStudent as jest.Mock).mockResolvedValue({ id: 99 });

        const { container } = render(<AddStudentPage />);

        // Fill form using name attributes for robustness
        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { name: 'name', value: 'Alice' } });
        fireEvent.change(container.querySelector('input[name="father_name"]')!, { target: { name: 'father_name', value: 'Bob' } });
        fireEvent.change(container.querySelector('input[name="surname"]')!, { target: { name: 'surname', value: 'Smith' } });
        fireEvent.change(container.querySelector('input[name="mobile"]')!, { target: { name: 'mobile', value: '9876543210' } });
        fireEvent.change(container.querySelector('input[name="dob"]')!, { target: { name: 'dob', value: '2015-05-15' } });
        fireEvent.change(container.querySelector('textarea[name="address"]')!, { target: { name: 'address', value: '123 Test St' } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { name: 'city', value: 'Mumbai' } });
        fireEvent.change(container.querySelector('input[name="zip_code"]')!, { target: { name: 'zip_code', value: '400001' } });

        const submitBtn = screen.getByRole('button', { name: /confirm admission/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.addStudent).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Alice',
                mobile: '9876543210'
            }));
        });

        expect(await screen.findByText(/admission successful/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/students');
        }, { timeout: 2000 });
    });

    it('handles API error on submission', async () => {
        (api.addStudent as jest.Mock).mockRejectedValue(new Error('Database error'));

        const { container } = render(<AddStudentPage />);

        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { name: 'name', value: 'Alice' } });
        fireEvent.change(container.querySelector('input[name="father_name"]')!, { target: { name: 'father_name', value: 'Bob' } });
        fireEvent.change(container.querySelector('input[name="surname"]')!, { target: { name: 'surname', value: 'Smith' } });
        fireEvent.change(container.querySelector('input[name="mobile"]')!, { target: { name: 'mobile', value: '9876543210' } });
        fireEvent.change(container.querySelector('input[name="dob"]')!, { target: { name: 'dob', value: '2015-05-15' } });
        fireEvent.change(container.querySelector('textarea[name="address"]')!, { target: { name: 'address', value: '123 Test St' } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { name: 'city', value: 'Mumbai' } });
        fireEvent.change(container.querySelector('input[name="zip_code"]')!, { target: { name: 'zip_code', value: '400001' } });

        const submitBtn = screen.getByRole('button', { name: /confirm admission/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/database error/i)).toBeInTheDocument();
    });
});
