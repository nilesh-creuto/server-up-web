import React from 'react';
import { ServiceStatus, ServerStatus } from '../../types';

type Status = ServiceStatus | ServerStatus;

const statusConfig: Record<string, { color: string; pulse: boolean; label: string }> = {
  ACTIVE:      { color: 'var(--status-active)', pulse: false, label: 'Active' },
  ONLINE:      { color: 'var(--status-active)', pulse: false, label: 'Online' },
  INACTIVE:    { color: 'var(--status-inactive)', pulse: false, label: 'Inactive' },
  OFFLINE:     { color: 'var(--status-inactive)', pulse: false, label: 'Offline' },
  STARTING:    { color: 'var(--status-starting)', pulse: true,  label: 'Starting' },
  STOPPING:    { color: 'var(--status-starting)', pulse: true,  label: 'Stopping' },
  FAILED:      { color: 'var(--status-failed)', pulse: false, label: 'Failed' },
  UNREACHABLE: { color: 'var(--status-failed)', pulse: false, label: 'Unreachable' },
  UNKNOWN:     { color: 'var(--text-tertiary)', pulse: false, label: 'Unknown' },
};

interface StatusDotProps {
  status: Status;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, showLabel = false, size = 'sm' }) => {
  const cfg = statusConfig[status] || statusConfig.UNKNOWN;
  const dotSize = size === 'sm' ? 7 : 9;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: cfg.color,
          flexShrink: 0,
          animation: cfg.pulse ? 'pulse 1.5s ease-in-out infinite' : (status === 'ACTIVE' || status === 'ONLINE' ? 'pulse-glow 3s ease-in-out infinite' : undefined),
          boxShadow: cfg.pulse ? `0 0 0 2px ${cfg.color}33` : (status === 'ACTIVE' || status === 'ONLINE' ? '0 0 8px rgba(74, 222, 128, 0.4)' : undefined),
        }}
        aria-label={cfg.label}
        role="img"
      />
      {showLabel && (
        <span style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>
          {cfg.label}
        </span>
      )}
    </span>
  );
};
