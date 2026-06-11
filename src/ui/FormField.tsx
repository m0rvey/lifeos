import { type ReactNode } from 'react';
 
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}
 
export default function FormField({
  label,
  error,
  required = false,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      <div className="form-field__control">{children}</div>
      {error && <span className="form-field__error-msg">{error}</span>}
    </div>
  );
}
