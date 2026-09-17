import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 420 }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth,
          padding: 32,
          boxShadow: 'var(--shadow-md)',
          animation: 'slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 24, lineHeight: 1, padding: 4,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
