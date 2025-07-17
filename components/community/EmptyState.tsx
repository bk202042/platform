import React from 'react';
import { MessageSquare, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'posts' | 'comments' | 'search' | 'category' | 'apartment';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EMPTY_STATE_CONFIG = {
  posts: {
    icon: <MessageSquare className="w-12 h-12 text-gray-400" />,
    title: '아직 게시글이 없습니다',
    description: '첫 번째 게시글을 작성해서 커뮤니티를 시작해보세요!',
    actionLabel: '게시글 작성하기',
  },
  comments: {
    icon: <MessageSquare className="w-8 h-8 text-gray-400" />,
    title: '첫 번째 댓글을 작성해보세요!',
    description: '이 게시글에 대한 의견을 나눠주세요.',
    actionLabel: '댓글 작성',
  },
  search: {
    icon: <Search className="w-12 h-12 text-gray-400" />,
    title: '검색 결과가 없습니다',
    description: '다른 키워드로 검색해보시거나 필터를 조정해보세요.',
    actionLabel: '검색 조건 변경',
  },
  category: {
    icon: <Filter className="w-12 h-12 text-gray-400" />,
    title: '이 카테고리에 게시글이 없습니다',
    description: '다른 카테고리를 확인해보시거나 새 게시글을 작성해보세요.',
    actionLabel: '게시글 작성하기',
  },
  apartment: {
    icon: <MessageSquare className="w-12 h-12 text-gray-400" />,
    title: '이 아파트에 게시글이 없습니다',
    description: '우리 아파트의 첫 번째 게시글을 작성해보세요!',
    actionLabel: '게시글 작성하기',
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayIcon = icon || config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {displayIcon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md text-sm sm:text-base">
        {displayDescription}
      </p>

      {(actionHref || onAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionHref ? (
            <Button asChild>
              <Link href={actionHref} className="flex items-center gap-2">
                <Plus size={16} />
                {displayActionLabel}
              </Link>
            </Button>
          ) : onAction ? (
            <Button onClick={onAction} className="flex items-center gap-2">
              <Plus size={16} />
              {displayActionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Specialized empty state components for common use cases
export function PostsEmptyState({ onCreatePost }: { onCreatePost?: () => void }) {
  return (
    <EmptyState
      type="posts"
      onAction={onCreatePost}
    />
  );
}

export function CommentsEmptyState({ onAddComment }: { onAddComment?: () => void }) {
  return (
    <EmptyState
      type="comments"
      onAction={onAddComment}
    />
  );
}

export function SearchEmptyState({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      type="search"
      actionLabel="검색 초기화"
      onAction={onClearSearch}
    />
  );
}

export function CategoryEmptyState({
  category,
  onCreatePost
}: {
  category: string;
  onCreatePost?: () => void;
}) {
  return (
    <EmptyState
      type="category"
      title={`${category} 카테고리에 게시글이 없습니다`}
      onAction={onCreatePost}
    />
  );
}

export function ApartmentEmptyState({
  apartmentName,
  onCreatePost
}: {
  apartmentName: string;
  onCreatePost?: () => void;
}) {
  return (
    <EmptyState
      type="apartment"
      title={`${apartmentName}에 게시글이 없습니다`}
      description={`${apartmentName}의 첫 번째 게시글을 작성해보세요!`}
      onAction={onCreatePost}
    />
  );
}
