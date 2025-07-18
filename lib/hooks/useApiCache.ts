"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiCacheOptions {
  cacheTime?: number; // Cache duration in milliseconds (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 1 minute)
  refetchOnWindowFocus?: boolean;
}

// Global cache store
const cache = new Map<string, CacheEntry<unknown>>();

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {},
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(
    async (force = false) => {
      const now = Date.now();
      const cached = cache.get(key);

      // Return cached data if it's still valid and not forced
      if (!force && cached && now < cached.expiresAt) {
        setData(cached.data as T);
        setIsLoading(false);
        setError(null);
        setIsStale(now > cached.timestamp + staleTime);
        return cached.data as T;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await fetcherRef.current();

        // Cache the result
        cache.set(key, {
          data: result,
          timestamp: now,
          expiresAt: now + cacheTime,
        });

        setData(result);
        setIsStale(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // If we have cached data, return it even if fetch failed
        if (cached) {
          setData(cached.data as T);
          setIsStale(true);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [key, cacheTime, staleTime],
  );

  const invalidate = useCallback(() => {
    cache.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      const now = Date.now();
      cache.set(key, {
        data: newData,
        timestamp: now,
        expiresAt: now + cacheTime,
      });
      setData(newData);
      setIsStale(false);
    },
    [key, cacheTime],
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = cache.get(key);
      if (cached && Date.now() > cached.timestamp + staleTime) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, staleTime, refetchOnWindowFocus, fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true),
    invalidate,
    mutate,
  };
}

// Utility function to clear all cache
export function clearAllCache() {
  cache.clear();
}

// Utility function to clear specific cache entries
export function clearCache(pattern: string | RegExp) {
  const keys = Array.from(cache.keys());
  keys.forEach((key) => {
    if (
      typeof pattern === "string" ? key.includes(pattern) : pattern.test(key)
    ) {
      cache.delete(key);
    }
  });
}
