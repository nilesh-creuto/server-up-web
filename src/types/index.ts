export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer';
  createdAt: string;
}

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'STARTING' | 'STOPPING' | 'FAILED' | 'UNKNOWN';
export type ServerStatus = 'ONLINE' | 'OFFLINE' | 'UNREACHABLE' | 'UNKNOWN';

export interface Service {
  _id: string;
  name: string;
  slug: string;
  containerName: string;
  deployCommand: string;
  status: ServiceStatus;
  lastDeployedAt: string | null;
  lastCheckedAt: string | null;
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  server: {
    host: string;
    port: number;
    username: string;
  };
  services: Service[];
  serverStatus: ServerStatus;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DeploymentStatus =
  | 'QUEUED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'EXECUTING'
  | 'HEALTH_CHECK'
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT';

export interface Deployment {
  _id: string;
  projectId: string;
  serviceId: string;
  serviceName: string;
  projectName: string;
  status: DeploymentStatus;
  logs: string[];
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  durationMs: number | null;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  projectName: string | null;
  serviceName: string | null;
  action: string;
  status: 'SUCCESS' | 'FAILED';
  detail: string;
  createdAt: string;
}

export type ControlServerState =
  | 'CONNECTING'
  | 'SERVER_WAKING'
  | 'SERVER_READY'
  | 'SERVER_UNAVAILABLE'
  | 'TIMEOUT';
