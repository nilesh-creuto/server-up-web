import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Service } from '../../types';
import { projectsApi } from '../../services/api';

interface StartServiceModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  service: Service | null;
  onDeploymentStarted: (deploymentId: string) => void;
}

export const StartServiceModal: React.FC<StartServiceModalProps> = ({
  open, onClose, projectId, service, onDeploymentStarted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!service) return;
    setError('');
    setLoading(true);
    try {
      const deploymentId = await projectsApi.startService(projectId, service._id);
      onDeploymentStarted(deploymentId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start service');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Deploy ${service.name}?`}>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
        You are about to deploy the <strong style={{ color: 'var(--text-primary)' }}>{service.name}</strong> service. This will connect to the server and run:
      </p>

      <div style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        color: 'var(--text-primary)',
        marginBottom: 24,
      }}>
        {service.deployCommand}
      </div>

      {error && (
        <div style={{ background: '#1A0B0B', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--status-failed)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" size="md" onClick={handleStart} loading={loading}>
          Deploy {service.name}
        </Button>
      </div>
    </Modal>
  );
};
