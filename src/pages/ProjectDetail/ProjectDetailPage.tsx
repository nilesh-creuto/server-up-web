import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStatus } from '../../hooks/useProjectStatus';
import { useDeployment } from '../../hooks/useDeployment';
import { StatusDot } from '../../components/ui/StatusDot';
import { Button } from '../../components/ui/Button';
import { StartServiceModal } from '../../components/services/StartServiceModal';
import { DeploymentProgress } from '../../components/deployment/DeploymentProgress';
import { Service } from '../../types';
import { formatRelativeTime, SERVICE_STATUS_LABEL } from '../../utils/status';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { project, loading, error, refresh } = useProjectStatus(id!, 30000);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  const { deployment } = useDeployment(activeDeploymentId);

  if (loading) {
    return (
      <div style={{ padding: 32, color: '#52525b', fontSize: 14 }}>Loading project...</div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: '#ef4444', fontSize: 14 }}>{error || 'Project not found'}</div>
        <Link to="/dashboard" style={{ color: '#4f6ef7', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 860 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Projects</Link>
        <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
            {project.name}
          </h1>
          {project.description && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '6px 0 0' }}>{project.description}</p>
          )}
        </div>
        <Button variant="secondary" size="md" onClick={refresh}>Refresh</Button>
      </div>

      {/* Server Info */}
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
        padding: '24px', marginBottom: 32,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
      }}>
        <ServerStat label="Server Status" value={<StatusDot status={project.serverStatus} showLabel size="md" />} />
        <ServerStat label="Host" value={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{'•'.repeat(project.server.host.length)}</span>} />
        <ServerStat label="Last Checked" value={formatRelativeTime(project.lastCheckedAt)} />
      </div>

      {/* Active Deployment */}
      {deployment && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Deployment
            </div>
            {(deployment.status === 'SUCCESS' || deployment.status === 'FAILED' || deployment.status === 'TIMEOUT') && (
              <button
                onClick={() => setActiveDeploymentId(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 12,
                }}
              >
                Dismiss ✕
              </button>
            )}
          </div>
          <DeploymentProgress deployment={deployment} />
        </div>
      )}

      {/* Services */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        Services ({project.services.length})
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {project.services.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            onStart={() => { setSelectedService(service); setModalOpen(true); }}
          />
        ))}
      </div>

      <StartServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={project._id}
        service={selectedService}
        onDeploymentStarted={(id) => {
          setActiveDeploymentId(id);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

const ServiceCard: React.FC<{ service: Service; onStart: () => void }> = ({ service, onStart }) => {
  const canDeploy = service.status !== 'STARTING' && service.status !== 'STOPPING';
  const statusColor: Record<string, string> = {
    ACTIVE: '#22c55e', INACTIVE: '#52525b', STARTING: '#f59e0b',
    STOPPING: '#f59e0b', FAILED: '#ef4444', UNKNOWN: '#3f3f46',
  };

  return (
    <div className="card-hover" style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border-subtle)`,
      borderRadius: 'var(--radius-md)',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{service.name}</span>
        <StatusDot status={service.status} />
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {SERVICE_STATUS_LABEL[service.status]}
      </div>

      <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)', marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {service.deployCommand}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: service.status === 'INACTIVE' || service.status === 'FAILED' ? 16 : 0 }}>
        {service.lastCheckedAt ? `Checked ${formatRelativeTime(service.lastCheckedAt)}` : 'Not checked'}
      </div>

      <div style={{ marginTop: 12 }}>
        <Button 
          variant={service.status === 'ACTIVE' ? 'secondary' : 'primary'} 
          size="sm" 
          onClick={onStart} 
          disabled={!canDeploy}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Deploy {service.name}
        </Button>
      </div>
    </div>
  );
};

const ServerStat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
  </div>
);
