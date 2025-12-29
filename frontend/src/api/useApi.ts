import { useState, useEffect, useCallback } from 'react';
import { api } from './client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useApi<T>(
  endpoint: string,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseApiResult<T> {
  const { immediate = true, onSuccess, onError } = options || {};

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await api.get<T>(endpoint);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState((prev) => ({ ...prev, loading: false, error }));
      onError?.(error);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export default useApi;
