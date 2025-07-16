import React from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import { CommunityCategory } from '@/lib/validation/community';
import { LikeButton } from './LikeButton';

export interface PostCardProps {
  post: {
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
  };
  onClick?: () => void;
}

// Category badge configuration with Korean labels and colors
const CATEGORY_CONFIG = {
  QNA: { label: 'Q&A', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  RECOMMEND: { label: '추천', color: 'bg-green-100 text-green-800 border-green-200' },
  SECONDHAND: { label: '중고거래', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  FREE: { label: '나눔', color: 'bg-purple-100 text-purple-800 border-purple-200' },
} as const;

export function PostCard({ post, onClick }: PostCardProps) {
  const categoryConfig = post.category ? CATEGORY_CONFIG[post.category] : null;

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 48) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
      });
    }
  };

  return (
    <article
      className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer overflow-hidden touch-manipulation"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={post.title ? `게시글: ${post.title}` : `게시글: ${post.body.slice(0, 50)}...`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative p-4 sm:p-5">
        {/* Header with category badge and apartment info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryConfig && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {post.apartments.cities?.name} · {post.apartments.name}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {post.title && (
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200">
              {post.title}
            </h3>
          )}

          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {post.body}
          </p>

          {/* Image indicator */}
          {post.images && post.images.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-4 h-4 bg-gray-200 rounded border flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-sm" />
              </div>
              <span>이미지 {post.images.length}개</span>
            </div>
          )}
        </div>

        {/* Footer with author, date, and engagement metrics */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User size={12} className="text-gray-400" />
              <span>{post.user?.name || '익명'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
            />
            <div className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-blue-500 transition-colors duration-200">
              <MessageCircle
                size={16}
                className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200"
                aria-label="댓글"
              />
              <span className="font-medium">{post.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
