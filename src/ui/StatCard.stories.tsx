import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    subtitle: { control: 'text' },
    trend: { control: 'select', options: ['up', 'down', 'neutral'] },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    label: 'Active Tasks',
    value: '12',
    subtitle: '3 overdue',
  },
};

export const WithTrend: Story = {
  args: {
    label: 'Energy Level',
    value: '78%',
    subtitle: '+5% from last week',
    trend: 'up',
  },
};

export const WithTrendDown: Story = {
  args: {
    label: 'Fatigue',
    value: '45%',
    subtitle: '+8% from yesterday',
    trend: 'down',
  },
};

export const Accent: Story = {
  args: {
    label: 'Total Distance',
    value: '234 km',
    subtitle: 'This month',
    accent: true,
  },
};
