import { useState, useEffect, useRef } from 'react';
import { deploymentsApi } from '../services/api';
import { Deployment } from '../types';
import { isTerminalDeploymentStatus } from '../utils/status';

export function useDeployment(deploymentId: string | null) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!deploymentId) return;

    const poll = async () => {
      try {
        const d = await deploymentsApi.get(deploymentId);
        setDeployment(d);

        if (isTerminalDeploymentStatus(d.status)) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch deployment');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000); // Poll every 3s during active deployment

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deploymentId]);

  return { deployment, error };
}
