import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '../ui/DataTable';

vi.mock('../i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

interface TestItem {
  id: string;
  name: string;
  value: number;
}

describe('DataTable', () => {
  const mockData: TestItem[] = [
    { id: '1', name: 'Item 1', value: 100 },
    { id: '2', name: 'Item 2', value: 200 },
    { id: '3', name: 'Item 3', value: 300 },
  ];

  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'value' as const, label: 'Value' },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={columns} data={mockData} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No items found" />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders default empty message when no emptyMessage provided', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('common.no_data')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<DataTable columns={columns} data={mockData} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not render delete column when onDelete is not provided', () => {
    const { container } = render(<DataTable columns={columns} data={mockData} />);

    const headers = container.querySelectorAll('th');
    expect(headers.length).toBe(2);
  });

  it('renders delete column when onDelete is provided', () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} onDelete={() => {}} />
    );

    const headers = container.querySelectorAll('th');
    expect(headers.length).toBe(3);
  });

  it('renders custom cell content when render function is provided', () => {
    const customColumns = [
      { key: 'name' as const, label: 'Name' },
      {
        key: 'value' as const,
        label: 'Value',
        render: (value: number) => <span className="custom-value">{value * 2}</span>,
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
  });
});
