import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AssignTeacherPage from '@/app/(dashboard)/subjects/assign/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));
jest.mock('@/components/ConfirmBox', () => ({
    ConfirmBox: ({ isOpen, onConfirm, onCancel, title, description }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, title: string, description: string }) => isOpen ? (
        <div data-testid="confirm-box">
            <h2>{title}</h2>
            <p>{description}</p>
            <button onClick={onConfirm}>Confirm</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ) : null
}));
jest.mock('@/lib/api', () => ({
    api: {
        getSubjects: jest.fn(),
        getStaff: jest.fn(),
        getSubjectAssignments: jest.fn(),
        assignTeacher: jest.fn(),
        unassignTeacher: jest.fn(),
    }
}));

// Mock Lucide icons as spans to avoid p > div nesting errors
jest.mock('lucide-react', () => ({
    UserPlus: () => <span data-testid="user-plus-icon" />,
    ArrowLeft: () => <span data-testid="arrow-left-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    User: () => <span data-testid="user-icon" />,
    AlertCircle: () => <span data-testid="alert-icon" />,
    CheckCircle2: () => <span data-testid="check-icon" />,
}));

const mockSubjects = [
    { id: 1, name: 'Mathematics' }
];

const mockStaff = {
    items: [
        { id: 101, name: 'John Doe', department: 'teaching' },
        { id: 102, name: 'Jane Smith', department: 'teaching' }
    ],
    total: 2
};

const mockAssignments = [
    {
        id: 10,
        subject_id: 1,
        teacher_id: 101,
        teacher: { id: 101, name: 'John Doe', department: 'teaching' }
    }
];

describe('AssignTeacherPage', () => {
    const mockBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin', department: 'admin' },
        });
        (useRouter as jest.Mock).mockReturnValue({
            back: mockBack,
        });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('1'),
        });

        (api.getSubjects as jest.Mock).mockResolvedValue(mockSubjects);
        (api.getStaff as jest.Mock).mockResolvedValue(mockStaff);
        (api.getSubjectAssignments as jest.Mock).mockResolvedValue(mockAssignments);
    });

    it('renders the assign page with subject name', async () => {
        render(<AssignTeacherPage />);

        await waitFor(() => {
            expect(screen.getByText(/assign teachers to mathematics/i)).toBeInTheDocument();
        });
    });

    it('displays already assigned teachers', async () => {
        render(<AssignTeacherPage />);

        await waitFor(() => {
            expect(screen.queryByText(/loading assignment details/i)).not.toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { level: 4, name: 'John Doe' })).toBeInTheDocument();
    });

    it('handles teacher assignment', async () => {
        (api.assignTeacher as jest.Mock).mockResolvedValue({ id: 11 });

        render(<AssignTeacherPage />);
        await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '102' } });
        fireEvent.click(screen.getByRole('button', { name: /assign teacher/i }));

        await waitFor(() => {
            expect(api.assignTeacher).toHaveBeenCalledWith({
                subject_id: 1,
                teacher_id: 102
            });
        });
    });

    it('handles unassignment request', async () => {
        (api.unassignTeacher as jest.Mock).mockResolvedValue({ message: 'Success' });

        render(<AssignTeacherPage />);
        await waitFor(() => {
            expect(screen.queryByText(/loading assignment details/i)).not.toBeInTheDocument();
        });
        expect(screen.getByRole('heading', { level: 4, name: 'John Doe' })).toBeInTheDocument();

        // Find the delete button next to John Doe
        const deleteBtn = screen.getByTitle('Unassign');
        // In the code: <button onClick={() => { setIdToDelete(a.id); setDeleteConfirmOpen(true); }} ...><Trash2 /></button>
        // The role button with no name might be tricky. Let's use getByTestId or similar if possible.
        // Actually, I mock Trash2.

        fireEvent.click(deleteBtn);

        // ConfirmBox appears
        expect(screen.getByText(/are you sure you want to remove this teacher/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            expect(api.unassignTeacher).toHaveBeenCalledWith(10);
        });
    });

    it('navigates back when back button is clicked', async () => {
        render(<AssignTeacherPage />);
        await waitFor(() => expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument());

        // The back button is the one with ArrowLeft
        const backBtn = screen.getByTestId('arrow-left-icon').closest('button');
        if (backBtn) fireEvent.click(backBtn);

        expect(mockBack).toHaveBeenCalled();
    });
});
