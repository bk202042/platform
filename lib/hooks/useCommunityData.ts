'use client';

import { useApiCache } from './useApiCache';
import { CommunityCategory } from '@/lib/validation/community';

interface Post {
  id: string;
  title?: string;
  body: string;
  images?: string[];
  user?: { name?: string };
  created_at: string;
  likes_count: number;
  comments_count: number;
  category?: CommunityCategory;
  apartments?: {
    name: string;
    cities?: { name: string } | null;
  };
}

interface PostsParams {
  city?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  sort?: 'popular' | 'latest';
  userId?: string;
}

// Client-side data fetching functions
async function fetchPosts(params: PostsParams): Promise<Post[]> {
  const searchParams = new URLSearchParams();

  if (params.city) searchParams.set('city', params.city);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  if (params.category) searchParams.set('category', params.category);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.userId) searchParams.set('userId', params.userId);

  const response = await fetch(`/api/community/posts?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

async function fetchPostCounts(params: { city?: string; apartmentId?: string }) {
  const searchParams = new URLSearchParams();

  if (params.city) searchParams.set('city', params.city);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);

  const response = await fetch(`/api/community/posts/counts?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch post counts');
  }

  return response.json();
}

// Custom hooks using the cache
export function usePosts(params: PostsParams) {
  const cacheKey = `posts:${JSON.stringify(params)}`;

  return useApiCache(
    cacheKey,
    () => fetchPosts(params),
    {
      cacheTime: 3 * 60 * 1000, // 3 minutes for posts
      staleTime: 30 * 1000, // 30 seconds stale time
      refetchOnWindowFocus: true,
    }
  );
}

export function usePostCounts(params: { city?: string; apartmentId?: string }) {
  const cacheKey = `post-counts:${JSON.stringify(params)}`;

  return useApiCache(
    cacheKey,
    () => fetchPostCounts(params),
    {
      cacheTime: 10 * 60 * 1000, // 10 minutes for counts (less frequently changing)
      staleTime: 2 * 60 * 1000, // 2 minutes stale time
      refetchOnWindowFocus: false, // Don't refetch counts on focus
    }
  );
}

// Utility to invalidate related caches when a post is created/updated/deleted
export function invalidatePostCaches() {
  import('./useApiCache').then(({ clearCache }) => {
    clearCache(/^posts:/);
    clearCache(/^post-counts:/);
  });
}
