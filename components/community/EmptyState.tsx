"use client";

import React from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  Heart,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  type: "posts" | "comments" | "search" | "category" | "apartment" | "likes";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const EMPTY_STATE_CONFIG = {
  posts: {
    icon: <MessageSquare className="h-12 w-12 text-gray-400" />,
    title: "아직 게시글이 없습니다",
    description: "첫 번째 게시글을 작성해서 커뮤니티를 시작해보세요!",
    actionLabel: "새 글 작성하기",
    actionIcon: <Plus className="h-4 w-4" />,
  },
  comments: {
    icon: <MessageSquare className="h-10 w-10 text-gray-400" />,
    title: "댓글이 없습니다",
    description: "첫 번째 댓글을 남겨보세요!",
    actionLabel: "댓글 작성하기",
    actionIcon: <Plus className="h-4 w-4" />,
  },
  search: {
    icon: <Search className="h-12 w-12 text-gray-400" />,
    title: "검색 결과가 없습니다",
    description: "다른 키워드로 검색해보시거나 필터를 조정해보세요.",
    actionLabel: "필터 초기화",
    actionIcon: <Filter className="h-4 w-4" />,
  },
  category: {
    icon: <Filter className="h-12 w-12 text-gray-400" />,
    title: "이 카테고리에 게시글이 없습니다",
    description: "다른 카테고리를 확인해보시거나 새 글을 작성해보세요.",
    actionLabel: "새 글 작성하기",
    actionIcon: <Plus className="h-4 w-4" />,
  },
  apartment: {
    icon: <Users className="h-12 w-12 text-gray-400" />,
    title: "이 아파트에 게시글이 없습니다",
    description: "같은 아파트 주민들과 소통을 시작해보세요!",
    actionLabel: "새 글 작성하기",
    actionIcon: <Plus className="h-4 w-4" />,
  },
  likes: {
    icon: <Heart className="h-12 w-12 text-gray-400" />,
    title: "좋아요한 게시글이 없습니다",
    description: "마음에 드는 게시글에 좋아요를 눌러보세요!",
    actionLabel: "커뮤니티 둘러보기",
    actionIcon: <MessageSquare className="h-4 w-4" />,
  },
} as const;

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayIcon = icon || config.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="mb-6">{displayIcon}</div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      <p className="text-gray-600 mb-8 max-w-md">{displayDescription}</p>

      {(actionHref || onAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionHref ? (
            <Button asChild className="flex items-center gap-2">
              <Link href={actionHref}>
                {config.actionIcon}
                {displayActionLabel}
              </Link>
            </Button>
          ) : onAction ? (
            <Button onClick={onAction} className="flex items-center gap-2">
              {config.actionIcon}
              {displayActionLabel}
            </Button>
          ) : null}

          {type !== "posts" && (
            <Button variant="outline" asChild>
              <Link href="/community">전체 게시글 보기</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized empty state components
export function PostsEmptyState({
  onCreatePost,
  showCreateButton = true,
}: {
  onCreatePost?: () => void;
  showCreateButton?: boolean;
}) {
  return (
    <EmptyState
      type="posts"
      actionHref={showCreateButton ? undefined : undefined}
      onAction={showCreateButton ? onCreatePost : undefined}
    />
  );
}

export function CommentsEmptyState({
  onAddComment,
}: {
  onAddComment?: () => void;
}) {
  return (
    <EmptyState type="comments" onAction={onAddComment} className="py-8" />
  );
}

export function SearchEmptyState({
  query,
  onClearFilters,
}: {
  query?: string;
  onClearFilters?: () => void;
}) {
  return (
    <EmptyState
      type="search"
      title={query ? `"${query}"에 대한 검색 결과가 없습니다` : undefined}
      onAction={onClearFilters}
    />
  );
}

export function CategoryEmptyState({
  category,
  onCreatePost,
}: {
  category?: string;
  onCreatePost?: () => void;
}) {
  return (
    <EmptyState
      type="category"
      title={category ? `${category} 카테고리에 게시글이 없습니다` : undefined}
      onAction={onCreatePost}
    />
  );
}

export function ApartmentEmptyState({
  apartmentName,
  onCreatePost,
}: {
  apartmentName?: string;
  onCreatePost?: () => void;
}) {
  return (
    <EmptyState
      type="apartment"
      title={apartmentName ? `${apartmentName}에 게시글이 없습니다` : undefined}
      onAction={onCreatePost}
    />
  );
}
