import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Deployment, DeploymentStatus } from '../../types';
import { DEPLOYMENT_STATUS_LABEL, formatDuration } from '../../utils/status';

const stepOrder: DeploymentStatus[] = ['QUEUED', 'CONNECTING', 'CONNECTED', 'EXECUTING', 'HEALTH_CHECK', 'SUCCESS'];

const stepIcon = (status: DeploymentStatus, current: DeploymentStatus): React.ReactNode => {
  const idx = stepOrder.indexOf(status);
  const currentIdx = stepOrder.indexOf(current);

  if (current === 'FAILED' || current === 'TIMEOUT') {
    return idx <= stepOrder.indexOf('EXECUTING') ? (
      <span style={{ color: '#ef4444' }}>✗</span>
    ) : (
      <span style={{ color: '#3f3f46' }}>○</span>
    );
  }

  if (currentIdx > idx) return <span style={{ color: 'var(--status-active)' }}>✓</span>;
  if (currentIdx === idx) {
    return (
      <span style={{
        display: 'inline-block',
        width: 8, height: 8,
        background: 'var(--status-starting)',
        borderRadius: '50%',
        animation: 'pulse-glow 2s ease-in-out infinite',
      }} />
    );
  }
  return <span style={{ color: 'var(--text-tertiary)' }}>○</span>;
};

interface DeploymentProgressProps {
  deployment: Deployment;
}

export const DeploymentProgress: React.FC<DeploymentProgressProps> = ({ deployment }) => {
  const { status, logs, startedAt, completedAt, durationMs, error } = deployment;
  const isFailed = status === 'FAILED' || status === 'TIMEOUT';
  const isSuccess = status === 'SUCCESS';

  useEffect(() => {
    if (isSuccess) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#22c55e', '#4ade80', '#e8e8ea']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#22c55e', '#4ade80', '#e8e8ea']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isSuccess]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isFailed ? 'rgba(248, 113, 113, 0.2)' : isSuccess ? 'rgba(74, 222, 128, 0.2)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-panel)',
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            {deployment.projectName} / {deployment.serviceName}
          </span>
          <span style={{
            marginLeft: 12, fontSize: 11, fontWeight: 600,
            color: isFailed ? 'var(--status-failed)' : isSuccess ? 'var(--status-active)' : 'var(--status-starting)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {DEPLOYMENT_STATUS_LABEL[status]}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#3f3f46', fontFamily: 'JetBrains Mono, monospace' }}>
          {formatDuration(durationMs)}
        </span>
      </div>

      {/* Steps */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1f' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stepOrder.map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <span style={{ width: 16, textAlign: 'center', flexShrink: 0 }}>
                {stepIcon(step, status)}
              </span>
              <span style={{
                color: stepOrder.indexOf(step) <= stepOrder.indexOf(status) ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>
                {DEPLOYMENT_STATUS_LABEL[step]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div
        style={{
          padding: '16px 20px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          maxHeight: 280,
          overflowY: 'auto',
          background: 'var(--bg-base)',
        }}
      >
        {logs.map((line, i) => (
          <div key={i} style={{ color: line.includes('ERROR') || line.includes('✗') ? 'var(--status-failed)' : line.includes('✓') ? 'var(--status-active)' : 'var(--text-secondary)' }}>
            {line}
          </div>
        ))}
        {!isSuccess && !isFailed && (
          <div style={{ color: 'var(--accent-primary)', animation: 'pulse-glow 1.5s ease-in-out infinite' }}>
            ▋
          </div>
        )}
      </div>

      {/* Error detail */}
      {error && (
        <div style={{ padding: '12px 20px', background: '#1A0B0B', borderTop: '1px solid rgba(248, 113, 113, 0.2)', fontSize: 13, color: 'var(--status-failed)' }}>
          {error}
        </div>
      )}
    </div>
  );
};
