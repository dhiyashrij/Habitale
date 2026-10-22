import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isDestructive ? 'var(--danger-light)' : 'var(--primary-light)',
              color: isDestructive ? 'var(--danger)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn btn-sm"
            style={{
              backgroundColor: isDestructive ? 'var(--danger)' : 'var(--primary)',
              color: '#FFFFFF',
              boxShadow: isDestructive
                ? '0 4px 12px rgba(223, 123, 123, 0.35)'
                : '0 4px 12px rgba(217, 155, 170, 0.35)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
