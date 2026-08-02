'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, api } from './api';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch on mount, plus a reload() for after you change something.
 *
 * No caching layer. These screens read data then act on it, so the extra
 * machinery would not earn its keep.
 */
export function useApi<T>(
  path: string | null,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  const [state, setState] = useState<State<T>>({ data: null, loading: Boolean(path), error: null });

  // Serialised so a fresh object literal each render does not re-trigger the fetch.
  const queryKey = JSON.stringify(query ?? {});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get<T>(path, JSON.parse(queryKey));
      if (mounted.current) setState({ data, loading: false, error: null });
    } catch (err) {
      if (mounted.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof ApiError ? err.message : 'Could not load this data',
        });
      }
    }
  }, [path, queryKey]);

  useEffect(() => {
    void run();
  }, [run]);

  return { ...state, reload: run, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
