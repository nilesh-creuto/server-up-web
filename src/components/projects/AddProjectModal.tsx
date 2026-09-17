import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { projectsApi } from '../../services/api';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ServiceDraft {
  name: string;
  slug: string;
  containerName: string;
  deployCommand: string;
}

const emptyService = (): ServiceDraft => ({
  name: '', slug: '', containerName: '', deployCommand: '/home/ubuntu/deployApi.sh',
});

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('ubuntu');
  const [sshKey, setSshKey] = useState('');
  const [services, setServices] = useState<ServiceDraft[]>([emptyService()]);

  const reset = () => {
    setStep(1); setName(''); setSlug(''); setDescription('');
    setHost(''); setPort('22'); setUsername('ubuntu');
    setSshKey(''); setServices([emptyService()]); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await projectsApi.create({
        name, slug,
        description,
        server: { host, port: parseInt(port), username, sshPrivateKey: sshKey },
        services,
      });
      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const updateService = (i: number, field: keyof ServiceDraft, val: string) => {
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New Project" maxWidth={540}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {(['Project', 'Server', 'Services'] as const).map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: step === i + 1 ? '#4f6ef7' : step > i + 1 ? '#22c55e' : '#1e1e24',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#fff', fontWeight: 600,
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 12, color: step === i + 1 ? '#e8e8ea' : '#52525b' }}>{label}</span>
            {i < 2 && <span style={{ color: '#2a2a31', margin: '0 2px' }}>›</span>}
          </div>
        ))}
      </div>

      {/* Step 1 — Project Info */}
      {step === 1 && (
        <div>
          <Field label="Project Name">
            <input style={inputStyle} value={name} onChange={(e) => {
              setName(e.target.value);
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
            }} placeholder="Brabima" />
          </Field>
          <Field label="Slug">
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="brabima" />
          </Field>
          <Field label="Description (optional)">
            <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Production API server" />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button variant="primary" size="md" onClick={() => setStep(2)} disabled={!name || !slug}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Server Config */}
      {step === 2 && (
        <div>
          <Field label="Server Host (IP or domain)">
            <input style={inputStyle} value={host} onChange={(e) => setHost(e.target.value)} placeholder="13.204.197.75" />
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Field label="SSH Port">
                <input style={inputStyle} value={port} onChange={(e) => setPort(e.target.value)} placeholder="22" type="number" />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="SSH Username">
                <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ubuntu" />
              </Field>
            </div>
          </div>
          <Field label="SSH Private Key (PEM contents)">
            <textarea
              style={{ ...inputStyle, height: 120, resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
              value={sshKey}
              onChange={(e) => setSshKey(e.target.value)}
              placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
            />
            <div style={{ fontSize: 11, color: '#3f3f46', marginTop: 4 }}>
              Encrypted before storage. Never returned to browser.
            </div>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)} disabled={!host || !sshKey}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Services */}
      {step === 3 && (
        <div>
          {services.map((s, i) => (
            <div key={i} style={{ background: '#0d0d10', border: '1px solid #1e1e24', borderRadius: 8, padding: '14px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a' }}>Service {i + 1}</span>
                {services.length > 1 && (
                  <button onClick={() => setServices((p) => p.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 16 }}>×</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={s.name} onChange={(e) => {
                    updateService(i, 'name', e.target.value);
                    updateService(i, 'slug', e.target.value.toLowerCase());
                  }} placeholder="API" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Container Name</label>
                  <input style={inputStyle} value={s.containerName} onChange={(e) => updateService(i, 'containerName', e.target.value)} placeholder="brabima-api" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Deploy Script Path</label>
                <input style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                  value={s.deployCommand}
                  onChange={(e) => updateService(i, 'deployCommand', e.target.value)}
                  placeholder="/home/ubuntu/deployApi.sh" />
              </div>
            </div>
          ))}
          <button
            onClick={() => setServices((p) => [...p, emptyService()])}
            style={{ background: 'none', border: '1px dashed #2a2a31', borderRadius: 7, width: '100%', padding: '10px', fontSize: 12, color: '#52525b', cursor: 'pointer', marginBottom: 16 }}
          >
            + Add Service
          </button>
          {error && (
            <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: '#fca5a5' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" size="md" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary" size="md" onClick={handleSubmit} loading={loading}
              disabled={services.some((s) => !s.name || !s.containerName || !s.deployCommand)}>
              Save Project
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: '#71717a', marginBottom: 6, fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d0d10', border: '1px solid #222228',
  borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#e8e8ea',
  outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};
