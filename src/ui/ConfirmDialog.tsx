import { useState } from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  requireTyping?: string;
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  variant = 'default',
  requireTyping,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');

  const handleConfirm = () => {
    setTypedValue('');
    onConfirm();
  };

  const handleCancel = () => {
    setTypedValue('');
    onCancel();
  };

  const isConfirmDisabled = requireTyping ? typedValue !== requireTyping : false;

  const footer = (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
      <button className="btn btn--secondary" onClick={handleCancel}>
        {cancelLabel}
      </button>
      <button
        className={`btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
        onClick={handleConfirm}
        disabled={isConfirmDisabled}
      >
        {confirmLabel}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} maxWidth="sm" footer={footer}>
      <div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: requireTyping ? '16px' : '0', lineHeight: 1.5 }}>
          {message}
        </p>
        
        {requireTyping && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Введите <strong style={{ color: 'var(--text-primary)' }}>{requireTyping}</strong> для подтверждения:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTyping}
              className="input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
