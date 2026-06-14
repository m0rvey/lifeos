import type { Meta, StoryObj } from '@storybook/react-vite';
import EmptyState from './EmptyState';
import { BookOpen } from 'lucide-react';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'Try adjusting your search or filters.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <BookOpen size={48} />,
    title: 'Journal is empty',
    description: 'Start writing to see your entries here.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <BookOpen size={48} />,
    title: 'No entries yet',
    description: 'Create your first entry to get started.',
    action: <button className="btn btn--primary">Create entry</button>,
  },
};

export const Minimal: Story = {
  args: {
    title: 'Nothing here',
  },
};
