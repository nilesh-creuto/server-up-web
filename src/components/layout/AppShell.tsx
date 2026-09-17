import React from 'react';
import { Sidebar } from './Sidebar';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh', padding: '0 16px' }}>
        <Outlet />
      </main>
    </div>
  );
};
