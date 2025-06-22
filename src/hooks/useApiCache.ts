import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiCacheOptions {
  cacheTime?: number; // Cache duration in milliseconds (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 1 minute)
}

export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { cacheTime = 5 * 60 * 1000, staleTime = 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = cacheRef.current.get(key);
        const now = Date.now();

        if (cached && now < cached.expiresAt) {
          // Use cached data if it's still valid
          setData(cached.data);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetchFn();
        
        // Cache the new data
        cacheRef.current.set(key, {
          data: freshData,
          timestamp: now,
          expiresAt: now + cacheTime,
        });

        setData(freshData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetchFn, cacheTime]);

  const invalidateCache = () => {
    cacheRef.current.delete(key);
  };

  const refetch = async () => {
    cacheRef.current.delete(key);
    setLoading(true);
    try {
      const freshData = await fetchFn();
      const now = Date.now();
      cacheRef.current.set(key, {
        data: freshData,
        timestamp: now,
        expiresAt: now + cacheTime,
      });
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, invalidateCache, refetch };
} 