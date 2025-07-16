'use client';

import React from 'react';
import { PostCard, PostCardProps } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquare, PlusCircle } from 'lucide-react';

interface PostListProps {
  /** Array of posts to display */
  posts?: PostCardProps['post'][];
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
  /** Current filter/category for contextual empty state */
  currentFilter?: string;
  /** Whether user is authenticated for contextual messaging */
  isAuthenticated?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Number of skeleton items to show during loading */
  skeletonCount?: number;
}

export function PostList({
  posts = [],
  isLoading = false,
  error = null,
  onRetry,
  onPostClick,
  onCreatePost,
  currentFilter,
  isAuthenticated = false,
  emptyStateMessage,
  errorMessage,
  skeletonCount = 3,
}: PostListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="게시글 목록 로딩 중"
        aria-live="polite"
      >
        <PostCardSkeleton count={skeletonCount} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <RefreshCw className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            게시글을 불러올 수 없습니다
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {errorMessage || '네트워크 연결을 확인하고 다시 시도해주세요.'}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
              aria-label="게시글 다시 불러오기"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              다시 시도
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <EmptyState
        currentFilter={currentFilter}
        isAuthenticated={isAuthenticated}
        onCreatePost={onCreatePost}
        customMessage={emptyStateMessage}
      />
    );
  }

  // Posts list
  return (
    <div
      className="space-y-4"
      role="feed"
      aria-label={`게시글 목록 (${posts.length}개)`}
      aria-live="polite"
    >
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          onClick={() => onPostClick?.(post.id)}
          aria-posinset={index + 1}
          aria-setsize={posts.length}
        />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  currentFilter?: string;
  isAuthenticated?: boolean;
  onCreatePost?: () => void;
  customMessage?: string;
}

function EmptyState({
  currentFilter,
  isAuthenticated,
  onCreatePost,
  customMessage
}: EmptyStateProps) {
  const getEmptyStateContent = () => {
    if (customMessage) {
      return {
        title: '게시글이 없습니다',
        message: customMessage,
        actionText: '첫 게시글 작성하기',
      };
    }

    if (currentFilter) {
      return {
        title: `'${currentFilter}' 카테고리에 게시글이 없습니다`,
        message: '이 카테고리에서 첫 번째 게시글을 작성해보세요!',
        actionText: '게시글 작성하기',
      };
    }

    return {
      title: '아직 게시글이 없습니다',
      message: '우리 아파트 커뮤니티의 첫 번째 게시글을 작성해보세요!',
      actionText: '첫 게시글 작성하기',
    };
  };

  const { title, message, actionText } = getEmptyStateContent();

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
          <MessageSquare className="w-8 h-8 text-blue-600" aria-hidden="true" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {isAuthenticated && onCreatePost && (
          <Button
            onClick={onCreatePost}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            aria-label={actionText}
          >
            <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            {actionText}
          </Button>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-gray-500 mt-4">
            게시글을 작성하려면 로그인이 필요합니다.
          </p>
        )}
      </div>
    </div>
  );
}

// Export the EmptyState component for standalone use
export { EmptyState };
