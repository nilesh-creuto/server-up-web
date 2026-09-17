import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/projects', label: 'Projects', icon: '◈' },
  { to: '/backups', label: 'DB Backups', icon: '🗄️' },
];

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  // Generate a random seed on every refresh
  const [avatarSeed] = React.useState(() => Math.random().toString(36).substring(7));

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Server Up
          </span>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>Control Panel</div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              margin: '2px 12px',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 12, opacity: 0.7 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img 
          src={`https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=e2e8f0`} 
          alt="Avatar" 
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-subtle)' }} 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              style={{ padding: 0, fontSize: 12, color: 'var(--status-failed)', height: 'auto', minHeight: 'auto' }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
