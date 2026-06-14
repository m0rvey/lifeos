import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Modal from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    maxWidth: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button className="btn btn--primary" onClick={() => setOpen(true)}>Open Modal</button>
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)}>
          <p>Modal content goes here.</p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Example Modal',
    maxWidth: 'md',
  },
};

export const Small: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button className="btn btn--primary" onClick={() => setOpen(true)}>Open Small Modal</button>
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)}>
          <p>Small modal content.</p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Confirm',
    maxWidth: 'sm',
  },
};
