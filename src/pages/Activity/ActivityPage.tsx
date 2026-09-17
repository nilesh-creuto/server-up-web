import React, { useEffect, useState } from 'react';
import { projectsApi } from '../../services/api';
import { AuditLog, Project } from '../../types';
import { formatRelativeTime } from '../../utils/status';

export const ActivityPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    projectsApi.list().then((list) => {
      setProjects(list);
      if (list.length > 0) setSelectedProject(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    projectsApi.audit(selectedProject).then(({ logs }) => {
      setLogs(logs);
      setLoading(false);
    });
  }, [selectedProject]);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 32px', letterSpacing: '-0.02em' }}>
        Activity Log
      </h1>

      {/* Project Selector */}
      <div style={{ marginBottom: 32 }}>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
            padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit',
            outline: 'none',
          }}
        >
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {loading && <div style={{ color: '#52525b', fontSize: 13 }}>Loading...</div>}

      {/* Log Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '8px 0' }}>
        {logs.map((log, i) => (
          <div key={log._id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '16px 24px',
            borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            {/* Status dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              background: log.status === 'SUCCESS' ? 'var(--status-active)' : 'var(--status-failed)',
              boxShadow: log.status === 'SUCCESS' ? '0 0 8px rgba(74, 222, 128, 0.4)' : 'none',
            }} />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {log.detail}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {log.userName}
                {log.serviceName && <span> · {log.serviceName}</span>}
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
              {formatRelativeTime(log.createdAt)}
            </div>
          </div>
        ))}

        {!loading && logs.length === 0 && (
          <div style={{ color: '#3f3f46', fontSize: 13, padding: '24px 0' }}>No activity yet.</div>
        )}
      </div>
    </div>
  );
};
