import React, { memo, useMemo, useCallback } from "react";
import { MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
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
    [post.category]
  );

  // Format date using date-fns for better relative time formatting
  const timeAgo = useMemo(() => {
    if (!post.created_at) return "";
    try {
      return formatDistanceToNow(new Date(post.created_at), {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "시간 정보 없음";
    }
  }, [post.created_at]);

  const ariaLabel = useMemo(
    () =>
      post.title
        ? `게시글: ${post.title}`
        : `게시글: ${post.body.slice(0, 50)}...`,
    [post.title, post.body]
  );

  // Use stable callbacks to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick]
  );

  return (
    <article
      className="group relative bg-white border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-200 cursor-pointer overflow-hidden touch-manipulation"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div className="p-4 sm:p-5">
        {/* Header with category and location - compact Daangn style */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryConfig && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.color}`}
              >
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {post.apartments.cities?.name} {post.apartments.name}
                </span>
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400 flex-shrink-0">{timeAgo}</span>
        </div>

        {/* Content - Daangn-style compact layout */}
        <div className="space-y-2">
          {post.title && (
            <h3 className="text-base font-semibold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
              {post.title}
            </h3>
          )}

          <p className="text-sm text-zinc-600 leading-normal line-clamp-2">
            {post.body}
          </p>

          {/* Image thumbnail preview - Daangn style */}
          {post.images && post.images.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4 bg-zinc-200 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-zinc-400 rounded-sm" />
              </div>
              <span className="text-xs text-zinc-500">
                사진 {post.images.length}
              </span>
            </div>
          )}
        </div>

        {/* Footer - simplified Daangn style */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <User size={12} className="text-zinc-400" />
            <span className="font-medium">
              {post.user?.name || "익명"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
            />
            <div className="flex items-center gap-1 text-zinc-500">
              <MessageCircle size={14} className="text-zinc-400" aria-label="댓글" />
              <span className="text-sm font-medium">
                {post.comments_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
