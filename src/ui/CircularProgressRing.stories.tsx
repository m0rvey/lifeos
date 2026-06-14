import type { Meta, StoryObj } from '@storybook/react-vite';
import CircularProgressRing from './CircularProgressRing';

const meta = {
  title: 'UI/CircularProgressRing',
  component: CircularProgressRing,
  tags: ['autodocs'],
} satisfies Meta<typeof CircularProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 65, size: 80, strokeWidth: 6 },
};

export const Low: Story = {
  args: { value: 25, size: 80, strokeWidth: 6, color: 'var(--error)' },
};

export const Medium: Story = {
  args: { value: 50, size: 80, strokeWidth: 6, color: 'var(--warning)' },
};

export const High: Story = {
  args: { value: 90, size: 80, strokeWidth: 6, color: 'var(--success)' },
};

export const Small: Story = {
  args: { value: 72, size: 48, strokeWidth: 5 },
};

export const Large: Story = {
  args: { value: 42, size: 120, strokeWidth: 10 },
};
