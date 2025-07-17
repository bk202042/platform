'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';
import { EmptyState } from './EmptyState';
import { NetworkError, useErrorType } from './NetworkError';
import { MobileErrorState } from './MobileErrorState';
import { MobileLoadingState } from './MobileLoadingState';
import { LazyLoad } from '@/components/common/LazyLoad';
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
  isLiked?: boolean;
  apartments?: {
    name: string;
    cities?: { name: string } | null;
  };
}

interface OptimizedPostListProps {
  posts?: Post[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPostClick?: (postId: string) => void;
  onCreatePost?: () => void;
  skeletonCount?: number;
  lazyLoadThreshold?: number;
}

export const OptimizedPostList = memo(function OptimizedPostList({
  posts = [],
  isLoading = false,
  error = null,
  onRetry,
  onPostClick,
  onCreatePost,
  skeletonCount = 3,
  lazyLoadThreshold = 5,
}: OptimizedPostListProps) {
  // Always call hooks at the top
  const errorObj = error ? new Error(error) : null;
  const networkErrorType = useErrorType(errorObj);

  // Map error types for different components
  const mobileErrorType = networkErrorType === 'timeout' ? 'server' :
                         networkErrorType === 'generic' ? 'general' :
                         networkErrorType || 'general';

  // Memoize click handlers to prevent unnecessary re-renders
  const handlePostClick = useCallback((postId: string) => {
    onPostClick?.(postId);
  }, [onPostClick]);

  // Split posts into immediate and lazy-loaded sections
  const { immediatePosts, lazyPosts } = useMemo(() => {
    if (posts.length <= lazyLoadThreshold) {
      return { immediatePosts: posts, lazyPosts: [] };
    }
    return {
      immediatePosts: posts.slice(0, lazyLoadThreshold),
      lazyPosts: posts.slice(lazyLoadThreshold),
    };
  }, [posts, lazyLoadThreshold]);

  if (isLoading) {
    return (
      <>
        {/* Mobile loading state */}
        <MobileLoadingState type="posts" className="md:hidden" />

        {/* Desktop loading state */}
        <div
          className="hidden md:block space-y-4"
          role="status"
          aria-label="게시글 목록 로딩 중"
        >
          {Array.from({ length: skeletonCount }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Mobile error state */}
        <MobileErrorState
          type={mobileErrorType}
          message={error}
          onRetry={onRetry}
          className="md:hidden"
        />

        {/* Desktop error state */}
        <div className="hidden md:block">
          <NetworkError
            type={networkErrorType || 'generic'}
            description={error}
            onRetry={onRetry}
          />
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return <EmptyState type="posts" onAction={onCreatePost} />;
  }

  return (
    <div
      className="space-y-3 sm:space-y-4"
      role="feed"
      aria-label={`게시글 목록 (${posts.length}개)`}
    >
      {/* Immediately rendered posts */}
      {immediatePosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => handlePostClick(post.id)}
          aria-posinset={index + 1}
          aria-setsize={posts.length}
        />
      ))}

      {/* Lazy-loaded posts */}
      {lazyPosts.length > 0 && (
        <LazyLoad
          fallback={
            <div className="space-y-4">
              {Array.from({ length: Math.min(3, lazyPosts.length) }, (_, i) => (
                <PostCardSkeleton key={`lazy-skeleton-${i}`} />
              ))}
            </div>
          }
        >
          {lazyPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post.id)}
              aria-posinset={immediatePosts.length + index + 1}
              aria-setsize={posts.length}
            />
          ))}
        </LazyLoad>
      )}
    </div>
  );
});
