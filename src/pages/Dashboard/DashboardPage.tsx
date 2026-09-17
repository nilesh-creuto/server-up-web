import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import { Project } from '../../types';
import { StatusDot } from '../../components/ui/StatusDot';
import { Button } from '../../components/ui/Button';
import { formatRelativeTime } from '../../utils/status';
import { useAuthStore } from '../../stores/authStore';
import { AddProjectModal } from '../../components/projects/AddProjectModal';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const { user } = useAuthStore();

  const loadProjects = async () => {
    try {
      const list = await projectsApi.list();
      setProjects(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Projects
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} configured
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            Add Project
          </Button>
        )}
      </div>

      {loading && (
        <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading projects...</div>
      )}

      {error && (
        <div style={{ background: '#1A0B0B', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--status-failed)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div style={{
          border: '1px dashed #222228', borderRadius: 10, padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>◈</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#52525b', marginBottom: 8 }}>No projects yet</div>
          {user?.role === 'admin' ? (
            <div style={{ fontSize: 13, color: '#3f3f46' }}>Click "+ Add Project" to configure your first server.</div>
          ) : (
            <div style={{ fontSize: 13, color: '#3f3f46' }}>Ask an admin to add a project.</div>
          )}
        </div>
      )}

      {/* Project Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      <AddProjectModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); loadProjects(); }} />
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const activeCount = project.services.filter((s) => s.status === 'ACTIVE').length;

  return (
    <Link
      to={`/projects/${project._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="card-hover"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Server status dot */}
        <StatusDot status={project.serverStatus} size="md" />

        {/* Project info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {project.name}
          </div>
          {project.description && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{project.description}</div>
          )}
        </div>

        {/* Services summary */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {activeCount}/{project.services.length} services active
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Checked {formatRelativeTime(project.lastCheckedAt)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {project.services.map((s) => (
              <StatusDot key={s._id} status={s.status} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
