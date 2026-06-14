import type { Meta, StoryObj } from '@storybook/react-vite';
import DataTable from './DataTable';
import type { Column } from './DataTable';

interface SampleRow {
  id: string;
  name: string;
  role: string;
  status: string;
}

const sampleColumns: Column<SampleRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
];

const sampleData: SampleRow[] = [
  { id: '1', name: 'Alice', role: 'Developer', status: 'Active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'Active' },
  { id: '3', name: 'Charlie', role: 'Manager', status: 'Inactive' },
];

type TableMeta = Meta<typeof DataTable<SampleRow>>;
const meta = {
  title: 'UI/DataTable',
  component: DataTable as TableMeta['component'],
  tags: ['autodocs'],
} satisfies TableMeta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
  },
};

export const Empty: Story = {
  args: {
    columns: sampleColumns,
    data: [],
    emptyMessage: 'No records found',
  },
};
