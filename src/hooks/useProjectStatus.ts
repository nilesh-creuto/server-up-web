import { useState, useEffect, useRef, useCallback } from 'react';
import { projectsApi } from '../services/api';
import { Project } from '../types';

export function useProjectStatus(projectId: string, intervalMs = 30000) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const p = await projectsApi.get(projectId);
      setProject(p);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refresh = useCallback(async () => {
    try {
      const p = await projectsApi.refresh(projectId);
      setProject(p);
    } catch {
      // Ignore — will retry on next poll
    }
  }, [projectId]);

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, intervalMs]);

  return { project, loading, error, refresh };
}
