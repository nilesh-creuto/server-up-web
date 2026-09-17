import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useServerWakeup } from '../../hooks/useServerWakeup';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { state: serverState, retry } = useServerWakeup();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setAuth(res.token, res.user as User);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, padding: 16 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, animation: 'float 4s ease-in-out infinite' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Server Up
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>Control Panel</div>
        </div>

        {/* Server wakeup states */}
        {serverState === 'CONNECTING' && (
          <WakeupBanner label="Connecting to control server..." spinner />
        )}
        {serverState === 'SERVER_WAKING' && (
          <WakeupBanner label="Server is waking up — this can take ~30s on first load..." spinner />
        )}
        {serverState === 'TIMEOUT' && (
          <WakeupBanner label="Control server is unavailable." action={<Button size="sm" variant="secondary" onClick={retry}>Retry</Button>} />
        )}

        {/* Login Form */}
        {serverState === 'SERVER_READY' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={inputStyle}
                placeholder="you@company.com"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                {error}
              </div>
            )}
            <Button variant="primary" size="lg" type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
              Sign in
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-panel)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const WakeupBanner: React.FC<{ label: string; spinner?: boolean; action?: React.ReactNode }> = ({ label, spinner, action }) => (
  <div style={{
    background: '#111118',
    border: '1px solid #1e1e2e',
    borderRadius: 8,
    padding: '14px 16px',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#71717a',
  }}>
    {spinner && (
      <span style={{
        width: 14, height: 14, border: '2px solid #4f6ef7', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
      }} />
    )}
    <span style={{ flex: 1 }}>{label}</span>
    {action}
  </div>
);
