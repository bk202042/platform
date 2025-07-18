import React, { memo, useMemo } from "react";
import { MessageCircle, Clock, User } from "lucide-react";
import { CommunityCategory } from "@/lib/validation/community";
import { LikeButton } from "./LikeButton";

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
  QNA: { label: "Q&A", color: "bg-blue-100 text-blue-800 border-blue-200" },
  RECOMMEND: {
    label: "추천",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  SECONDHAND: {
    label: "중고거래",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  FREE: {
    label: "나눔",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
} as const;

export const PostCard = memo(function PostCard({
  post,
  onClick,
}: PostCardProps) {
  const categoryConfig = useMemo(
    () => (post.category ? CATEGORY_CONFIG[post.category] : null),
    [post.category],
  );

  // Format date for better readability - memoized to avoid recalculation
  const formattedDate = useMemo(() => {
    const date = new Date(post.created_at);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "방금 전";
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 48) {
      return "어제";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
      });
    }
  }, [post.created_at]);

  const ariaLabel = useMemo(
    () =>
      post.title
        ? `게시글: ${post.title}`
        : `게시글: ${post.body.slice(0, 50)}...`,
    [post.title, post.body],
  );

  return (
    <article
      className="group relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer overflow-hidden touch-manipulation active:scale-[0.98] sm:active:scale-100"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative p-3 xs:p-4 sm:p-5 md:p-6">
        {/* Header with category badge and apartment info */}
        <div className="flex items-start justify-between gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-5">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-wrap">
            {categoryConfig && (
              <span
                className={`inline-flex items-center px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-medium border ${categoryConfig.color}`}
              >
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-md truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] lg:max-w-none">
                <span className="hidden sm:inline">
                  {post.apartments.cities?.name} ·{" "}
                </span>
                {post.apartments.name}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
          {post.title && (
            <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200 leading-tight xs:leading-normal sm:leading-relaxed">
              {post.title}
            </h3>
          )}

          <p className="text-gray-700 text-xs xs:text-sm sm:text-base leading-relaxed line-clamp-2 xs:line-clamp-3 sm:line-clamp-3">
            {post.body}
          </p>

          {/* Image indicator */}
          {post.images && post.images.length > 0 && (
            <div className="flex items-center gap-1 xs:gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded border flex items-center justify-center">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 bg-gray-400 rounded-sm" />
              </div>
              <span className="text-xs xs:text-sm">
                이미지 {post.images.length}개
              </span>
            </div>
          )}
        </div>

        {/* Footer with author, date, and engagement metrics */}
        <div className="flex items-center justify-between mt-3 xs:mt-4 sm:mt-5 pt-2 xs:pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-xs text-gray-500 min-w-0 flex-1">
            <div className="flex items-center gap-0.5 xs:gap-1 min-w-0">
              <User
                size={10}
                className="text-gray-400 flex-shrink-0 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5"
              />
              <span className="truncate text-xs xs:text-sm font-medium">
                {post.user?.name || "익명"}
              </span>
            </div>
            <div className="flex items-center gap-0.5 xs:gap-1 flex-shrink-0">
              <Clock
                size={10}
                className="text-gray-400 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5"
              />
              <span className="whitespace-nowrap text-xs xs:text-sm">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-shrink-0 ml-2">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
            />
            <div className="flex items-center gap-0.5 xs:gap-1 text-sm text-gray-600 group-hover:text-blue-500 transition-colors duration-200">
              <MessageCircle
                size={12}
                className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4"
                aria-label="댓글"
              />
              <span className="font-medium text-xs xs:text-sm">
                {post.comments_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
