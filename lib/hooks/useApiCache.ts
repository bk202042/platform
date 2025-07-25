"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiCache } from "@/lib/utils/cache";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiCacheOptions {
  cacheTime?: number; // Cache duration in milliseconds (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 1 minute)
  refetchOnWindowFocus?: boolean;
  persistent?: boolean; // Use persistent cache
  retryOnError?: boolean; // Retry failed requests
  maxRetries?: number; // Maximum number of retries
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
}

// Enhanced global cache store with performance optimizations
const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus = true,
    persistent = false,
    retryOnError = true,
    maxRetries = 3,
    staleWhileRevalidate = true,
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

      // Check if there's already a pending request
      const pendingRequest = pendingRequests.get(key);
      if (pendingRequest && !force) {
        try {
          const result = await pendingRequest;
          setData(result as T);
          setIsLoading(false);
          setError(null);
          setIsStale(false);
          return result as T;
        } catch (_err) {
          // Handle error from pending request
        }
      }

      // Check memory cache first
      let cached = cache.get(key);

      // If not in memory cache, check persistent cache
      if (!cached && persistent) {
        const persistentData = apiCache.get(key);
        if (persistentData) {
          cached = {
            data: persistentData,
            timestamp: now - staleTime, // Mark as potentially stale
            expiresAt: now + cacheTime,
          };
          cache.set(key, cached);
        }
      }

      // Return cached data if it's still valid and not forced
      if (!force && cached && now < cached.expiresAt) {
        setData(cached.data as T);
        setIsLoading(false);
        setError(null);
        setIsStale(now > cached.timestamp + staleTime);
        return cached.data as T;
      }

      // If we have stale data and staleWhileRevalidate is enabled
      if (cached && staleWhileRevalidate && !force) {
        setData(cached.data as T);
        setIsLoading(false);
        setIsStale(true);

        // Fetch fresh data in background
        fetchFreshData(
          key,
          fetcherRef.current,
          cacheTime,
          maxRetries,
          persistent,
          retryOnError
        );

        return cached.data as T;
      }

      // Fetch fresh data
      return fetchFreshData(
        key,
        fetcherRef.current,
        cacheTime,
        maxRetries,
        persistent,
        retryOnError
      );
    },
    [
      key,
      cacheTime,
      staleTime,
      persistent,
      retryOnError,
      maxRetries,
      staleWhileRevalidate,
    ]
  );

  const invalidate = useCallback(() => {
    cache.delete(key);
    if (persistent) {
      apiCache.delete(key);
    }
    fetchData(true);
  }, [key, persistent, fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      const now = Date.now();
      const cacheEntry = {
        data: newData,
        timestamp: now,
        expiresAt: now + cacheTime,
      };

      cache.set(key, cacheEntry);

      if (persistent) {
        apiCache.set(key, newData, { ttl: cacheTime, persistent: true });
      }

      setData(newData);
      setIsStale(false);
    },
    [key, cacheTime, persistent]
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

// Helper function for background fetching
async function fetchFreshData<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheTime: number,
  maxRetries: number,
  persistent: boolean,
  retryOnError: boolean
): Promise<T> {
  const fetchWithRetry = async (retryCount = 0): Promise<T> => {
    try {
      const result = await fetcher();
      const now = Date.now();

      // Cache the result in both memory and persistent cache
      const cacheEntry = {
        data: result,
        timestamp: now,
        expiresAt: now + cacheTime,
      };

      cache.set(key, cacheEntry);

      if (persistent) {
        apiCache.set(key, result, { ttl: cacheTime, persistent: true });
      }

      return result;
    } catch (err) {
      if (retryOnError && retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(retryCount + 1);
      }
      throw err;
    }
  };

  const promise = fetchWithRetry();
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
}

// Specialized hooks for common use cases
export function usePostsCache(params: Record<string, string> = {}) {
  const key = `posts_${JSON.stringify(params)}`;
  return useApiCache(
    key,
    () =>
      fetch(`/api/community/posts?${new URLSearchParams(params)}`).then((r) =>
        r.json()
      ),
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
      staleTime: 30 * 1000, // 30 seconds
      staleWhileRevalidate: true,
      persistent: false,
    }
  );
}

export function usePostCache(postId: string) {
  return useApiCache(
    `post_${postId}`,
    () => fetch(`/api/community/posts/${postId}`).then((r) => r.json()),
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 2 * 60 * 1000, // 2 minutes
      persistent: true,
      staleWhileRevalidate: true,
    }
  );
}

export function useUserLocationCache() {
  return useApiCache(
    "user_locations",
    () => fetch("/api/community/user-locations").then((r) => r.json()),
    {
      cacheTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      persistent: true,
      staleWhileRevalidate: true,
    }
  );
}

// Utility function to clear all cache
export function clearAllCache() {
  cache.clear();
  pendingRequests.clear();
  apiCache.clear();
}

// Utility function to clear specific cache entries
export function clearCache(pattern: string | RegExp) {
  const keys = Array.from(cache.keys());
  keys.forEach((key) => {
    if (
      typeof pattern === "string" ? key.includes(pattern) : pattern.test(key)
    ) {
      cache.delete(key);
      pendingRequests.delete(key);
      apiCache.delete(key);
    }
  });
}

// Cache invalidation helpers
export const cacheUtils = {
  invalidatePostsCache: () => {
    clearCache(/^posts_/);
  },

  invalidatePostCache: (postId: string) => {
    clearCache(`post_${postId}`);
  },

  invalidateUserCache: () => {
    clearCache("user_locations");
  },

  getCacheStats: () => {
    return {
      memorySize: cache.size,
      pendingRequests: pendingRequests.size,
      apiCacheStats: apiCache.getStats(),
    };
  },

  preloadData: <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: UseApiCacheOptions = {}
  ) => {
    // Only preload if not already cached
    if (!cache.has(key)) {
      fetchFreshData(
        key,
        fetcher,
        options.cacheTime || 5 * 60 * 1000,
        options.maxRetries || 3,
        options.persistent || false,
        options.retryOnError !== false
      ).catch((error) => {
        console.warn(`Failed to preload data for key ${key}:`, error);
      });
    }
  },
};

// Cleanup expired cache entries periodically
if (typeof window !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now > entry.expiresAt) {
          cache.delete(key);
        }
      }
    },
    5 * 60 * 1000
  ); // Every 5 minutes
}
