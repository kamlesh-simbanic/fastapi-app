import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import ClassesPage from '@/app/(dashboard)/classes/page';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/components/AuthContext');
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
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
    Layers: function LayersMock() { return <div data-testid="layers-icon" />; },
    Plus: function PlusMock() { return <div data-testid="plus-icon" />; },
    Search: function SearchMock() { return <div data-testid="search-icon" />; },
    Loader2: function Loader2Mock() { return <div data-testid="loader-icon" />; },
    X: function XMock() { return <div data-testid="x-icon" />; },
    ChevronDown: function ChevronDownMock() { return <div data-testid="chevron-down-icon" />; },
    AlertCircle: function AlertCircleMock() { return <div data-testid="alert-circle-icon" />; },
    ChevronLeft: function ChevronLeftMock() { return <div data-testid="chevron-left-icon" />; },
    ChevronRight: function ChevronRightMock() { return <div data-testid="chevron-right-icon" />; },
    Edit2: function Edit2Mock() { return <div data-testid="edit-icon" />; },
    Trash2: function Trash2Mock() { return <div data-testid="trash-icon" />; },
    Users: function UsersMock() { return <div data-testid="users-icon" />; },
    User: function UserMock() { return <div data-testid="user-icon" />; },
}));

const mockClasses = [
    { id: 1, standard: '10th', division: 'A', class_teacher_id: 1, class_teacher: { name: 'Teacher 1' } },
    { id: 2, standard: '10th', division: 'B', class_teacher_id: 2, class_teacher: { name: 'Teacher 2' } },
    { id: 3, standard: '11th', division: 'A', class_teacher_id: 3, class_teacher: { name: 'Teacher 3' } },
];

const mockStaff = [
    { id: 1, name: 'Teacher 1', qualification: 'M.Ed' },
    { id: 2, name: 'Teacher 2', qualification: 'B.Ed' },
    { id: 3, name: 'Teacher 3', qualification: 'B.Sc' },
];

describe('ClassesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1, name: 'Admin' },
        });
        (api.getClasses as jest.Mock).mockResolvedValue({
            items: mockClasses,
            total: mockClasses.length
        });
        (api.getStaff as jest.Mock).mockResolvedValue({
            items: mockStaff,
            total: mockStaff.length
        });
    });

    it('renders the class management heading', async () => {
        render(<ClassesPage />);
        expect(await screen.findByText(/class management/i)).toBeInTheDocument();
    });

    it('fetches and displays classes in the table', async () => {
        render(<ClassesPage />);

        const classTitle = await screen.findByText((content) => content.includes('10th') && content.includes('A'));
        expect(classTitle).toBeInTheDocument();
        expect(screen.getByText('Teacher 1')).toBeInTheDocument();
        expect(api.getClasses).toHaveBeenCalled();
    });

    it('filters classes when searching', async () => {
        render(<ClassesPage />);

        const searchInput = await screen.findByPlaceholderText(/filter by standard or division/i);
        fireEvent.change(searchInput, { target: { value: '11th' } });

        await waitFor(() => {
            expect(screen.getByText(/11th - A/i)).toBeInTheDocument();
            expect(screen.queryByText(/10th - A/i)).not.toBeInTheDocument();
        });
    });

    it('opens create class modal and submits successfully', async () => {
        (api.addClass as jest.Mock).mockResolvedValue({ id: 4, standard: '12th', division: 'A' });

        render(<ClassesPage />);

        const createBtn = await screen.findByRole('button', { name: /create class/i });
        fireEvent.click(createBtn);

        const modal = await screen.findByRole('heading', { name: /create new class/i }).then(h => h.closest('.fixed'));
        expect(modal).toBeInTheDocument();

        if (modal) {
            const standardInput = within(modal as HTMLElement).getByPlaceholderText(/e.g. 1st/i);
            const divisionInput = within(modal as HTMLElement).getByPlaceholderText(/e.g. A/i);

            fireEvent.change(standardInput, { target: { value: '12th' } });
            fireEvent.change(divisionInput, { target: { value: 'A' } });

            const submitBtn = within(modal as HTMLElement).getByRole('button', { name: /create class/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(api.addClass).toHaveBeenCalledWith(expect.objectContaining({
                    standard: '12th',
                    division: 'A'
                }));
            });
        }
    });

    it('opens edit class modal with pre-populated data', async () => {
        render(<ClassesPage />);

        await screen.findByText(/10th - A/i);

        const editButtons = await screen.findAllByTestId('edit-icon');
        fireEvent.click(editButtons[0]);

        const modal = await screen.findByRole('heading', { name: /edit class/i }).then(h => h.closest('.fixed'));
        expect(modal).toBeInTheDocument();

        if (modal) {
            expect(within(modal as HTMLElement).getByDisplayValue('10th')).toBeInTheDocument();
            expect(within(modal as HTMLElement).getByDisplayValue('A')).toBeInTheDocument();
        }
    });

    it('handles class deletion', async () => {
        (api.deleteClass as jest.Mock).mockResolvedValue({ detail: 'Deleted' });

        render(<ClassesPage />);

        await screen.findByText(/10th - A/i);

        const deleteButtons = await screen.findAllByTestId('trash-icon');
        fireEvent.click(deleteButtons[0]);

        await screen.findByText(/are you sure\?/i);

        const confirmBtn = await screen.findByRole('button', { name: /^delete$/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.deleteClass).toHaveBeenCalled();
        });
    });
});
