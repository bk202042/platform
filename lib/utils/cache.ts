// Advanced caching utilities for performance optimization

import React from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  serialize?: boolean; // Whether to serialize data for localStorage
}

// In-memory cache with TTL and size limits
class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Persistent cache using localStorage
class PersistentCache<T = unknown> {
  private prefix: string;

  constructor(prefix = "app_cache_") {
    this.prefix = prefix;
  }

  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, data: T, ttl = 24 * 60 * 60 * 1000): void {
    if (typeof window === "undefined") return;

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to set cache item:", error);
    }
  }

  get(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);

      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn("Failed to get cache item:", error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      localStorage.removeItem(this.getStorageKey(key));
      return true;
    } catch (error) {
      console.warn("Failed to delete cache item:", error);
      return false;
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  // Clean up expired items
  cleanup(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item: CacheItem<unknown> = JSON.parse(stored);
              if (now - item.timestamp > item.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch (_error) {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn("Failed to cleanup cache:", error);
    }
  }
}

// Combined cache manager
export class CacheManager<T = unknown> {
  private memoryCache: MemoryCache<T>;
  private persistentCache: PersistentCache<T>;

  constructor(options: CacheOptions = {}) {
    this.memoryCache = new MemoryCache(options.maxSize);
    this.persistentCache = new PersistentCache();

    // Cleanup expired items periodically
    if (typeof window !== "undefined") {
      setInterval(
        () => {
          this.memoryCache.cleanup();
          this.persistentCache.cleanup();
        },
        5 * 60 * 1000
      ); // Every 5 minutes
    }
  }

  set(
    key: string,
    data: T,
    options: { ttl?: number; persistent?: boolean } = {}
  ): void {
    const { ttl = 5 * 60 * 1000, persistent = false } = options;

    this.memoryCache.set(key, data, ttl);

    if (persistent) {
      this.persistentCache.set(key, data, ttl);
    }
  }

  get(key: string): T | null {
    // Try memory cache first
    let data = this.memoryCache.get(key);
    if (data !== null) return data;

    // Fallback to persistent cache
    data = this.persistentCache.get(key);
    if (data !== null) {
      // Restore to memory cache
      this.memoryCache.set(key, data);
      return data;
    }

    return null;
  }

  has(key: string): boolean {
    return this.memoryCache.has(key) || this.persistentCache.has(key);
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      memorySize: this.memoryCache.size(),
      memoryMaxSize: 100, // Default max size
    };
  }
}

// Global cache instances
export const apiCache = new CacheManager();
export const imageCache = new CacheManager();
export const userCache = new CacheManager();

// Cache invalidation strategies
export const cacheInvalidation = {
  // Invalidate all post-related caches
  invalidatePostCaches: () => {
    const keys = ["posts", "post_counts", "popular_posts"];
    keys.forEach((key) => apiCache.delete(key));
  },

  // Invalidate user-related caches
  invalidateUserCaches: (userId?: string) => {
    if (userId) {
      userCache.delete(`user_${userId}`);
      userCache.delete(`user_profile_${userId}`);
    } else {
      userCache.clear();
    }
  },

  // Invalidate location-related caches
  invalidateLocationCaches: () => {
    const keys = ["cities", "apartments", "user_locations"];
    keys.forEach((key) => apiCache.delete(key));
  },
};

// React hook for cached API calls
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; persistent?: boolean } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = apiCache.get(key);
        if (cachedData) {
          setData(cachedData as T);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        setLoading(true);
        const freshData = await fetcher();

        // Cache the result
        apiCache.set(key, freshData, options);

        setData(freshData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetcher, options]);

  return { data, loading, error };
}

// Preload data into cache
export function preloadData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  // Check if already cached
  if (apiCache.has(key)) return;

  // Fetch and cache in background
  fetcher()
    .then((data) => {
      apiCache.set(key, data, options);
    })
    .catch((error) => {
      console.warn(`Failed to preload data for key ${key}:`, error);
    });
}

// Cache warming for critical data
export function warmCache() {
  if (typeof window === "undefined") return;

  // Preload critical data that's likely to be needed
  preloadData("cities", () => fetch("/api/cities").then((r) => r.json()));
  preloadData("popular_posts", () =>
    fetch("/api/community/posts?sort=popular&limit=10").then((r) => r.json())
  );
}

// Initialize cache warming on app start
if (typeof window !== "undefined") {
  // Warm cache after a short delay to not block initial render
  setTimeout(warmCache, 1000);
}
