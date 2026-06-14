import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField from '../ui/FormField';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when required is true', () => {
    render(
      <FormField label="Test Label" required>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show required indicator when required is false', () => {
    render(
      <FormField label="Test Label" required={false}>
        <input type="text" />
      </FormField>
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('shows error message when error is provided', () => {
    render(
      <FormField label="Test Label" error="This field is required">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error class when error is provided', () => {
    const { container } = render(
      <FormField label="Test Label" error="This field is required">
        <input type="text" />
      </FormField>
    );

    const formField = container.firstChild;
    expect(formField).toHaveClass('form-field--error');
  });

  it('does not apply error class when no error', () => {
    const { container } = render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );

    const formField = container.firstChild;
    expect(formField).not.toHaveClass('form-field--error');
  });
});
