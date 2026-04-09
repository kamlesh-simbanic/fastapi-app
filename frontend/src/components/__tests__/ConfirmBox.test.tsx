import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmBox } from '@/components/ConfirmBox';

describe('ConfirmBox Component', () => {
    const defaultProps = {
        isOpen: true,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        title: 'Confirm Action',
        description: 'Are you sure you want to do this?',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<ConfirmBox {...defaultProps} />);

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        const { container } = render(<ConfirmBox {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        render(<ConfirmBox {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<ConfirmBox {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('displays loading state and disables buttons', () => {
        render(<ConfirmBox {...defaultProps} loading={true} />);

        const buttons = screen.getAllByRole('button');
        // Close button (index 0) is NOT disabled based on implementation
        // Confirm button (index 1) should be disabled
        // Cancel button (index 2) should be disabled
        expect(buttons[1]).toBeDisabled();
        expect(buttons[2]).toBeDisabled();
    });

    it('renders different variants correctly', () => {
        const { rerender } = render(<ConfirmBox {...defaultProps} variant="success" />);
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();

        rerender(<ConfirmBox {...defaultProps} variant="warning" />);
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();

        rerender(<ConfirmBox {...defaultProps} variant="info" />);
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    });
});
