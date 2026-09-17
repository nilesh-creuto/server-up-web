import { api } from './client';
import { Project, Deployment, AuditLog } from '../../types';

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>('/api/projects').then((r) => r.projects),
  get: (id: string) => api.get<{ project: Project }>(`/api/projects/${id}`).then((r) => r.project),
  create: (data: unknown) => api.post<{ project: Project }>('/api/projects', data).then((r) => r.project),
  update: (id: string, data: unknown) => api.patch<{ project: Project }>(`/api/projects/${id}`, data).then((r) => r.project),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
  refresh: (id: string) => api.post<{ project: Project }>(`/api/projects/${id}/refresh`).then((r) => r.project),
  status: (id: string) => api.get<{ serverStatus: string; services: unknown[]; lastCheckedAt: string }>(`/api/projects/${id}/status`),
  startService: (projectId: string, serviceId: string) =>
    api.post<{ deploymentId: string }>(`/api/projects/${projectId}/services/${serviceId}/start`).then((r) => r.deploymentId),
  deployments: (id: string) => api.get<{ deployments: Deployment[] }>(`/api/projects/${id}/deployments`).then((r) => r.deployments),
  audit: (id: string, page = 1) => api.get<{ logs: AuditLog[]; total: number; pages: number }>(`/api/projects/${id}/audit?page=${page}`),
};

export const deploymentsApi = {
  get: (id: string) => api.get<{ deployment: Deployment }>(`/api/deployments/${id}`).then((r) => r.deployment),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: unknown }>('/api/auth/login', { email, password }),
  me: () => api.get<{ user: unknown }>('/api/auth/me').then((r) => r.user),
};

export const backupsApi = {
  list: () => api.get<{ backups: any[] }>('/api/backups').then((r) => r.backups),
  create: (name: string, mongoUri: string) => api.post<{ backup: any }>('/api/backups', { name, mongoUri }).then((r) => r.backup),
  run: (id: string) => api.post<{ backup: any }>(`/api/backups/${id}/run`).then((r) => r.backup),
  delete: (id: string) => api.delete(`/api/backups/${id}`),
};
