import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table, { Column } from '@/components/Table';

interface TestData {
    id: number;
    name: string;
    age: number;
}

const columns: Column<TestData>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
];

const data: TestData[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
];

describe('Table Component', () => {
    it('renders data correctly', () => {
        render(<Table columns={columns} data={data} />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('displays loading state', () => {
        render(<Table columns={columns} data={[]} loading={true} />);

        expect(screen.getByText(/loading records/i)).toBeInTheDocument();
    });

    it('displays empty message when no data', () => {
        const emptyMsg = 'Nothing here';
        render(<Table columns={columns} data={[]} emptyMessage={emptyMsg} />);

        expect(screen.getByText(emptyMsg)).toBeInTheDocument();
    });

    it('calls onSort when a sortable column header is clicked', () => {
        const onSort = jest.fn();
        render(<Table columns={columns} data={data} onSort={onSort} />);

        const nameHeader = screen.getByText('Name');
        fireEvent.click(nameHeader);

        expect(onSort).toHaveBeenCalledWith('name');
    });

    it('calls onPageChange when pagination buttons are clicked', () => {
        const onPageChange = jest.fn();
        render(
            <Table
                columns={columns}
                data={data}
                page={1}
                pageSize={10}
                totalCount={20}
                onPageChange={onPageChange}
            />
        );

        const nextButton = screen.getAllByRole('button').pop()!;
        fireEvent.click(nextButton);

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageSizeChange when page size selector changes', () => {
        const onPageSizeChange = jest.fn();
        render(
            <Table
                columns={columns}
                data={data}
                pageSize={10}
                onPageSizeChange={onPageSizeChange}
            />
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '25' } });

        expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
});
