import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProjects } from '../services/projects.js';

/**
 * Loads the project list and exposes an explicit status so the UI can render
 * proper loading / error / empty states instead of an empty section.
 *
 * status: 'loading' | 'success' | 'error'
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  // Lets us cancel an in-flight request on unmount or refetch.
  const requestRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestRef.current?.abort();
    };
  }, []);

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setStatus('loading');
    setError(null);

    try {
      const data = await fetchProjects({ signal: controller.signal });
      if (!isMountedRef.current) return;

      setProjects(data);
      setStatus('success');
    } catch (caught) {
      // An abort is not a failure - a newer request is already in flight.
      if (controller.signal.aborted || !isMountedRef.current) return;

      setError(caught);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, status, error, reload: load };
}
