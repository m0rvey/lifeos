import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Name',
    children: <input className="input" type="text" placeholder="Enter name" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email address',
    children: <input className="input" type="text" defaultValue="invalid" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Title',
    required: true,
    children: <input className="input" type="text" placeholder="Required" />,
  },
};
