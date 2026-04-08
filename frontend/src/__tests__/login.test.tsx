import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('@/components/AuthContext');
jest.mock('next/navigation');

describe('LoginPage', () => {
    const mockLogin = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            login: mockLogin,
            loading: false,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('renders the login form correctly', () => {
        render(<LoginPage />);

        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls login function with correct data on submit', async () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('displays error message if login fails', async () => {
        const errorMessage = 'Invalid credentials';
        mockLogin.mockRejectedValueOnce(new Error(errorMessage));

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('redirects to home if user is already logged in', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: '1', name: 'Test User' },
            login: mockLogin,
            loading: false,
        });

        render(<LoginPage />);

        expect(mockPush).toHaveBeenCalledWith('/');
    });
});
