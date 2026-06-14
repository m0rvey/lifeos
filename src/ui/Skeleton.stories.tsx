import type { Meta, StoryObj } from '@storybook/react-vite';
import Skeleton from './Skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: 'text' },
};

export const Heading: Story = {
  args: { variant: 'heading' },
};

export const Circle: Story = {
  args: { variant: 'circle', width: 40, height: 40 },
};

export const Rect: Story = {
  args: { variant: 'rect', width: 200, height: 120 },
};

export const Card: Story = {
  args: { variant: 'card' },
};

export const Avatar: Story = {
  args: { variant: 'avatar' },
};

export const Button: Story = {
  args: { variant: 'button' },
};

export const MultiLine: Story = {
  args: { variant: 'text', lines: 3 },
};
