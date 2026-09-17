import { ServiceStatus, ServerStatus, DeploymentStatus } from '../types';

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  STARTING: 'Starting',
  STOPPING: 'Stopping',
  FAILED: 'Failed',
  UNKNOWN: 'Unknown',
};

export const SERVER_STATUS_LABEL: Record<ServerStatus, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  UNREACHABLE: 'Unreachable',
  UNKNOWN: 'Unknown',
};

export const DEPLOYMENT_STATUS_LABEL: Record<DeploymentStatus, string> = {
  QUEUED: 'Queued',
  CONNECTING: 'Connecting',
  CONNECTED: 'Connected',
  EXECUTING: 'Executing',
  HEALTH_CHECK: 'Health Check',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  TIMEOUT: 'Timed Out',
};

export function isTerminalDeploymentStatus(status: DeploymentStatus): boolean {
  return ['SUCCESS', 'FAILED', 'TIMEOUT'].includes(status);
}

export function formatRelativeTime(date: string | null): string {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(date).toLocaleDateString();
}

export function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}
