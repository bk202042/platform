"use client";

import React, { memo, useCallback } from "react";
import { PostCard, PostCardProps } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { MobileLoadingState } from "./MobileLoadingState";
import { MobileErrorState } from "./MobileErrorState";
import { EmptyState } from "./EmptyState";
import { NetworkError, useNetworkError } from "./NetworkError";

interface PostListProps {
  /** Array of posts to display */
  posts?: PostCardProps["post"][];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Function to retry loading posts */
  onRetry?: () => void;
  /** Function called when a post is clicked */
  onPostClick?: (postId: string) => void;
  /** Function called when create post is clicked */
  onCreatePost?: () => void;
  /** Number of skeleton items to show during loading */
  skeletonCount?: number;
}

export const PostList = memo(function PostList({
  posts = [],
  isLoading = false,
  error = null,
  onRetry,
  onPostClick,
  onCreatePost,
  skeletonCount = 3,
}: PostListProps) {
  // Always call hooks at the top
  const { error: networkError, handleError } = useNetworkError();

  // Handle error if present
  React.useEffect(() => {
    if (error) {
      handleError(new Error(error));
    }
  }, [error, handleError]);

  // Memoize click handlers to prevent unnecessary re-renders
  const handlePostClick = useCallback(
    (postId: string) => {
      onPostClick?.(postId);
    },
    [onPostClick],
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile loading state */}
        <MobileLoadingState
          message="게시글을 불러오는 중..."
          className="md:hidden"
        />

        {/* Desktop loading state */}
        <div
          className="hidden md:block space-y-4"
          role="status"
          aria-label="게시글 목록 로딩 중"
          aria-live="polite"
        >
          <PostCardSkeleton count={skeletonCount} />
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {/* Mobile error state */}
        <MobileErrorState
          type="network"
          description={error}
          onRetry={onRetry}
          className="md:hidden"
        />

        {/* Desktop error state */}
        <div className="hidden md:block">
          <NetworkError
            type={networkError?.type || "generic"}
            description={error}
            onRetry={onRetry}
          />
        </div>
      </>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return <EmptyState type="posts" onAction={onCreatePost} />;
  }

  // Posts list
  return (
    <div
      className="space-y-3 sm:space-y-4"
      role="feed"
      aria-label={`게시글 목록 (${posts.length}개)`}
      aria-live="polite"
    >
      {posts.map((post, index) => (
        <div role="article" key={post.id}>
          <PostCard
            post={post}
            onClick={() => handlePostClick(post.id)}
            aria-posinset={index + 1}
            aria-setsize={posts.length}
          />
        </div>
      ))}
    </div>
  );
});
