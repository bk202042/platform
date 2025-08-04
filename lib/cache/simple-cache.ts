import { unstable_cache } from "next/cache";

// Cache configuration types
export interface CacheConfig {
  ttl?: number;
  tags?: string[];
  revalidate?: number;
}

// Default cache configurations
export const CACHE_CONFIGS = {
  cities: {
    ttl: 86400,
    revalidate: 86400,
    tags: ['cities', 'locations'],
  },
  properties: {
    ttl: 300,
    revalidate: 300,
    tags: ['properties', 'listings'],
  },
  communityPosts: {
    ttl: 60,
    revalidate: 60,
    tags: ['community', 'posts'],
  },
  searchResults: {
    ttl: 180,
    revalidate: 180,
    tags: ['search', 'results'],
  },
} as const;

// Simple cache key generation
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}_${String(params[key])}`)
    .join('_');
  
  return `${prefix}_${paramString}`;
}

// Create cached function wrapper
export function createCachedFunction<TParams extends Record<string, unknown>, TResult>(
  key: string,
  fn: (params: TParams) => Promise<TResult>,
  config: CacheConfig = {}
) {
  const { tags = [], revalidate = 300 } = config;
  
  return unstable_cache(
    async (params: TParams): Promise<TResult> => {
      return await fn(params);
    },
    [key],
    {
      tags,
      revalidate,
    }
  );
}

// Utility functions for common caching patterns
export function createStaticDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  customConfig?: Partial<CacheConfig>
) {
  const config = { ...CACHE_CONFIGS.cities, ...customConfig };
  
  return createCachedFunction(
    key,
    async () => fetcher(),
    config
  );
}

export function createDynamicDataCache<TParams extends Record<string, unknown>, TResult>(
  key: string,
  fetcher: (params: TParams) => Promise<TResult>,
  customConfig?: Partial<CacheConfig>
) {
  const config = { ...CACHE_CONFIGS.communityPosts, ...customConfig };
  
  return createCachedFunction(key, fetcher, config);
}

export function createSearchCache<TParams extends Record<string, unknown>, TResult>(
  key: string,
  fetcher: (params: TParams) => Promise<TResult>,
  customConfig?: Partial<CacheConfig>
) {
  const config = { ...CACHE_CONFIGS.searchResults, ...customConfig };
  
  return createCachedFunction(key, fetcher, config);
}

// Cache invalidation helpers
export async function invalidateCache(tags: string[]): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    for (const tag of tags) {
      revalidateTag(tag);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Performance monitoring for cache usage
export class SimpleCacheMetrics {
  private static enabled = process.env.NODE_ENV === 'development';
  private static stats = new Map<string, { calls: number; lastUsed: number }>();
  
  static recordUsage(key: string): void {
    if (!this.enabled) return;
    
    const current = this.stats.get(key) || { calls: 0, lastUsed: 0 };
    this.stats.set(key, {
      calls: current.calls + 1,
      lastUsed: Date.now(),
    });
  }
  
  static getStats(): Record<string, { calls: number; lastUsed: string }> {
    if (!this.enabled) return {};
    
    const result: Record<string, { calls: number; lastUsed: string }> = {};
    
    for (const [key, stats] of this.stats.entries()) {
      result[key] = {
        calls: stats.calls,
        lastUsed: new Date(stats.lastUsed).toISOString(),
      };
    }
    
    return result;
  }
  
  static clearStats(): void {
    this.stats.clear();
  }
}