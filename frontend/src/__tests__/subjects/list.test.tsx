import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SubjectsPage from '@/app/(dashboard)/subjects/page';
import { useAuth } from '@/components/AuthContext';
import { useGlobalData } from '@/context/GlobalContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/context/GlobalContext');
jest.mock('@/lib/api', () => ({
    api: {
        getStaff: jest.fn(),
        getSubjectAssignments: jest.fn(),
        addSubject: jest.fn(),
        updateSubject: jest.fn(),
        deleteSubject: jest.fn(),
        assignTeacher: jest.fn(),
        unassignTeacher: jest.fn(),
    }
}));

// Mock Lucide icons as spans
jest.mock('lucide-react', () => ({
    BookOpen: () => <span data-testid="book-open-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    X: () => <span data-testid="x-icon" />,
    AlertCircle: () => <span data-testid="alert-icon" />,
    UserPlus: () => <span data-testid="user-plus-icon" />,
    UserMinus: () => <span data-testid="user-minus-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    Edit2: () => <span data-testid="edit-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    ArrowUp: () => <span data-testid="arrow-up-icon" />,
    ArrowDown: () => <span data-testid="arrow-down-icon" />,
    ChevronLeft: () => <span data-testid="chevron-left-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    ArrowUpDown: () => <span data-testid="arrow-up-down-icon" />,
}));

const mockSubjects = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Science' }
];

const mockAssignments = [
    {
        id: 10,
        subject_id: 1,
        teacher_id: 101,
        teacher: { id: 101, name: 'John Doe', department: 'Teaching' }
    }
];

const mockStaff = {
    items: [
        { id: 101, name: 'John Doe', department: 'Teaching' },
        { id: 102, name: 'Jane Smith', department: 'Teaching' }
    ],
    total: 2
};

describe('SubjectsPage', () => {
    const refreshSubjects = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin', department: 'admin' },
        });
        (useGlobalData as jest.Mock).mockReturnValue({
            subjects: mockSubjects,
            loading: { subjects: false },
            refreshSubjects: refreshSubjects,
        });
        (api.getStaff as jest.Mock).mockResolvedValue(mockStaff);
        (api.getSubjectAssignments as jest.Mock).mockResolvedValue(mockAssignments);
    });

    it('renders the subject management heading', () => {
        render(<SubjectsPage />);
        expect(screen.getByRole('heading', { level: 1, name: /subject management/i })).toBeInTheDocument();
    });

    it('displays the list of subjects', () => {
        render(<SubjectsPage />);
        expect(screen.getByRole('cell', { name: 'Mathematics' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Science' })).toBeInTheDocument();
    });

    it('searches for a subject', () => {
        render(<SubjectsPage />);
        const searchInput = screen.getByPlaceholderText(/search subjects/i);
        fireEvent.change(searchInput, { target: { value: 'Math' } });

        // Use a more specific selector to avoid multiple matches (table cell vs right panel header)
        expect(screen.getByRole('cell', { name: 'Mathematics' })).toBeInTheDocument();
        expect(screen.queryByRole('cell', { name: 'Science' })).not.toBeInTheDocument();
    });

    it('opens add subject modal and submits', async () => {
        (api.addSubject as jest.Mock).mockResolvedValue({ id: 3, name: 'History' });

        render(<SubjectsPage />);
        fireEvent.click(screen.getByRole('button', { name: /add subject/i }));

        expect(screen.getByText(/add subject/i, { selector: 'h2' })).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/enter subject name/i), { target: { value: 'History' } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(api.addSubject).toHaveBeenCalledWith({ name: 'History' });
            expect(refreshSubjects).toHaveBeenCalled();
        });
    });

    it('displays assigned teachers when a subject is selected', async () => {
        render(<SubjectsPage />);

        // Subject 1 (Mathematics) is selected by default in useEffect if not selected
        await waitFor(() => {
            expect(api.getSubjectAssignments).toHaveBeenCalledWith(1);
        });

        // Target the teacher name in the assignments list
        expect(screen.getByRole('heading', { level: 4, name: 'John Doe' })).toBeInTheDocument();
    });

    it('opens assign teacher modal and assigns a new teacher', async () => {
        (api.assignTeacher as jest.Mock).mockResolvedValue({ id: 11 });

        render(<SubjectsPage />);

        // Wait for default selection and assignment fetch
        await waitFor(() => expect(api.getSubjectAssignments).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: /assign new/i }));

        expect(screen.getByText(/assign teacher/i, { selector: 'h2' })).toBeInTheDocument();

        // Jane Smith should be available as John Doe is already assigned
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '102' } });
        fireEvent.click(screen.getByRole('button', { name: /assign now/i }));

        await waitFor(() => {
            expect(api.assignTeacher).toHaveBeenCalledWith({
                subject_id: 1,
                teacher_id: 102
            });
        });
    });

    it('unassigns a teacher', async () => {
        (api.unassignTeacher as jest.Mock).mockResolvedValue({ message: 'Success' });

        render(<SubjectsPage />);
        await waitFor(() => expect(screen.getByRole('heading', { level: 4, name: 'John Doe' })).toBeInTheDocument());

        const unassignBtn = screen.getByTitle(/unassign/i);
        fireEvent.click(unassignBtn);

        await waitFor(() => {
            expect(api.unassignTeacher).toHaveBeenCalledWith(10);
        });
    });
});
