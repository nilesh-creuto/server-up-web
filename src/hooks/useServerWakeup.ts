import { useState, useEffect, useCallback } from 'react';
import { ControlServerState } from '../types';
import { api } from '../services/api/client';

const MAX_ATTEMPTS = 6;
const BACKOFF = [1000, 2000, 3000, 5000, 8000, 15000];

export function useServerWakeup() {
  const [state, setState] = useState<ControlServerState>('CONNECTING');
  const [attempt, setAttempt] = useState(0);

  const check = useCallback(async () => {
    try {
      await api.health();
      setState('SERVER_READY');
    } catch {
      if (attempt === 0) {
        setState('SERVER_WAKING');
      }

      if (attempt >= MAX_ATTEMPTS) {
        setState('TIMEOUT');
        return;
      }

      const delay = BACKOFF[attempt] || 15000;
      setAttempt((a) => a + 1);
      setTimeout(check, delay);
    }
  }, [attempt]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    setState('CONNECTING');
    setAttempt(0);
    check();
  }, [check]);

  return { state, attempt, retry };
}
