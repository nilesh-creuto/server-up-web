import React, { useState, useEffect } from 'react';
import { backupsApi } from '../../services/api';

export const BackupsPage: React.FC = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Record<string, boolean>>({});

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [formError, setFormError] = useState('');

  const fetchBackups = async () => {
    try {
      const data = await backupsApi.list();
      setBackups(data);
    } catch (err) {
      console.error('Failed to load backups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await backupsApi.create(name, mongoUri);
      setShowAddModal(false);
      setName('');
      setMongoUri('');
      fetchBackups();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create backup project');
    }
  };

  const handleRunBackup = async (id: string) => {
    setRunning({ ...running, [id]: true });
    try {
      await backupsApi.run(id);
      await fetchBackups();
    } catch (err) {
      alert('Failed to run backup. Check logs for details.');
    } finally {
      setRunning({ ...running, [id]: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backup project?')) return;
    try {
      await backupsApi.delete(id);
      fetchBackups();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 600 }}>Database Backups</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your database backup projects and stream them to Google Drive.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          + Add Project
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading backup projects...</div>
      ) : backups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, background: 'var(--bg-panel)', borderRadius: 12, border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗄️</div>
          <h3 style={{ marginBottom: 8 }}>No Backup Projects</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add your first database project to start automated backups.</p>
          <button onClick={() => setShowAddModal(true)} style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }}>Add Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {backups.map((project) => {
            const lastLog = project.logs && project.logs[0];
            return (
              <div key={project._id} style={{ background: 'var(--bg-panel)', borderRadius: 12, padding: 24, border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{project.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{project.slug}</div>
                  </div>
                  <button onClick={() => handleDelete(project._id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 4 }}>Delete</button>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, marginBottom: 24, flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>LAST BACKUP LOG</div>
                  {lastLog ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: lastLog.status === 'SUCCESS' ? '#4ADE80' : '#F87171' }} />
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{lastLog.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(lastLog.timestamp).toLocaleString()}
                        {lastLog.status === 'SUCCESS' && ` • ${(lastLog.fileSize / 1024).toFixed(2)} KB`}
                      </div>
                      {lastLog.error && <div style={{ fontSize: 12, color: '#F87171', marginTop: 8 }}>{lastLog.error}</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No backups run yet.</div>
                  )}
                </div>

                <button
                  onClick={() => handleRunBackup(project._id)}
                  disabled={running[project._id]}
                  style={{
                    background: running[project._id] ? 'var(--bg-elevated)' : 'var(--primary)',
                    color: running[project._id] ? 'var(--text-secondary)' : '#fff',
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 600,
                    cursor: running[project._id] ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {running[project._id] ? (
                    <>Running Backup...</>
                  ) : (
                    <>Run Backup Now ☁️</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-panel)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400, border: '1px solid var(--border-default)' }}>
            <h2 style={{ marginBottom: 24 }}>Add Backup Project</h2>
            {formError && <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#F87171', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Production DB"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>MongoDB Connection URL</label>
                <input
                  type="password"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
