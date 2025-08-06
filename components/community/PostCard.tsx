import React, { memo, useMemo, useCallback, useState } from "react";
import { MessageCircle, User, Eye, Heart, Share2 } from "lucide-react";
import { CommunityCategory } from "@/lib/validation/community";
import { PostImage } from "@/lib/types/community";
import { LikeButton } from "./LikeButton";
import { ClientTimeDisplay } from "@/components/common/ClientTimeDisplay";
import { useMobileGestures } from "@/lib/hooks/useMobileGestures";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface PostCardProps {
  post: {
    id: string;
    title?: string;
    body: string;
    images?: PostImage[];
    user?: { name?: string };
    created_at: string;
    likes_count: number;
    comments_count: number;
    views_count?: number;
    category?: CommunityCategory;
    isLiked?: boolean;
    apartments?: {
      name: string;
      cities?: { name: string } | null;
    };
  };
  onClick?: () => void;
  showImages?: boolean; // New prop to control image visibility
  compact?: boolean; // New prop for compact layout
  listMode?: boolean; // New prop for Daangn-style list layout
}

// Category badge configuration with Korean labels and Daangn-style colors
const CATEGORY_CONFIG = {
  QNA: {
    label: "질문답변",
    color: "bg-blue-50 text-blue-700 border border-blue-100",
    icon: "❓"
  },
  RECOMMEND: {
    label: "추천정보",
    color: "bg-green-50 text-green-700 border border-green-100",
    icon: "👍"
  },
  SECONDHAND: {
    label: "중고거래",
    color: "bg-carrot-50 text-carrot-700 border border-carrot-100",
    icon: "🛍️"
  },
  FREE: {
    label: "나눔",
    color: "bg-purple-50 text-purple-700 border border-purple-100",
    icon: "🎁"
  },
} as const;

export const PostCard = memo(function PostCard({
  post,
  onClick,
  showImages = true,
  compact = false,
  listMode = false,
}: PostCardProps) {
  const [swipeAction, setSwipeAction] = useState<'like' | 'share' | null>(null);
  const categoryConfig = useMemo(
    () => (post.category ? CATEGORY_CONFIG[post.category] : null),
    [post.category]
  );

  // Remove time formatting logic - now handled by ClientTimeDisplay

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

  // Handle swipe gestures for mobile interactions
  const handleSwipeRight = useCallback(() => {
    setSwipeAction('like');
    // Trigger like action here
    setTimeout(() => setSwipeAction(null), 300);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    setSwipeAction('share');
    // Trigger share action here
    setTimeout(() => setSwipeAction(null), 300);
  }, []);

  const { gestureHandlers, gestureState } = useMobileGestures({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
    minDistance: 80,
    maxVerticalDistance: 100,
    enableHaptic: true,
  });

  // Daangn-style list layout
  if (listMode) {
    return (
      <article
        className="group py-3 px-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-daangn touch-target"
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start gap-2">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-carrot-600 transition-daangn">
              {post.title || post.body}
            </h3>
            
            {/* Location and metadata row - prominently displayed */}
            <div className="flex items-center text-xs text-gray-500 mb-2">
              {/* Location - more prominent */}
              {post.apartments && (
                <>
                  <span className="font-medium text-gray-700">
                    {post.apartments.cities?.name}
                  </span>
                  <span className="mx-1.5 text-gray-300">•</span>
                </>
              )}
              
              {/* Time */}
              <ClientTimeDisplay
                dateString={post.created_at}
                className="text-xs text-gray-400"
              />
            </div>
            
            {/* Engagement metrics - positioned at bottom right like Daangn */}
            <div className="flex items-center justify-end text-xs text-gray-300 space-x-1.5 mt-0.5">
              {post.comments_count > 0 && (
                <div className="flex items-center gap-0.5">
                  <MessageCircle size={9} className="text-gray-300" />
                  <span className="font-normal">{post.comments_count}</span>
                </div>
              )}
              {post.likes_count > 0 && (
                <div className="flex items-center gap-0.5">
                  <Heart size={9} className="text-gray-300" />
                  <span className="font-normal">{post.likes_count}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right thumbnail - much smaller like Daangn */}
          {showImages && post.images && post.images.length > 0 && post.images[0].public_url && (
            <div className="flex-shrink-0">
              <div className="relative w-6 h-6 rounded-md overflow-hidden bg-gray-50">
                <Image
                  src={post.images[0].public_url}
                  alt={post.images[0].alt_text || "게시글 이미지"}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
                {/* Multiple images indicator */}
                {post.images.length > 1 && (
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-80 text-white text-xs px-0.5 py-0.5 rounded-tl-sm font-normal leading-none">
                    +{post.images.length - 1}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative bg-white border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 hover:shadow-daangn-md transition-daangn cursor-pointer overflow-hidden touch-manipulation active:bg-gray-100",
        gestureState.isActive && gestureState.direction === 'right' && "bg-red-25 border-red-200",
        gestureState.isActive && gestureState.direction === 'left' && "bg-blue-25 border-blue-200",
        compact && "py-2" // Reduced padding for compact mode
      )}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      {...gestureHandlers}
    >
      <div className={cn(
        "p-4 sm:p-5",
        compact && "p-3 sm:p-4" // Reduced padding for compact mode
      )}>
        {/* Header with category and location - Daangn style */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryConfig && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${categoryConfig.color} transition-daangn`}
              >
                <span className="text-xs">{categoryConfig.icon}</span>
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="truncate max-w-[120px] sm:max-w-none font-medium text-gray-600">
                  {post.apartments.cities?.name}
                </span>
              </span>
            )}
          </div>
          <ClientTimeDisplay
            dateString={post.created_at}
            className="text-xs text-gray-400 flex-shrink-0"
          />
        </div>

        {/* Content - enhanced Daangn-style layout */}
        <div className={cn(
          "space-y-2",
          compact && "space-y-1" // Reduced spacing for compact mode
        )}>
          {post.title && (
            <h3 className={cn(
              "text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-carrot-600 transition-daangn leading-tight",
              compact && "text-sm" // Smaller title for compact mode
            )}>
              {post.title}
            </h3>
          )}

          <p className={cn(
            "text-sm text-gray-600 leading-normal line-clamp-2 group-hover:text-gray-700 transition-daangn",
            compact && "text-xs line-clamp-1" // Smaller text and single line for compact mode
          )}>
            {post.body}
          </p>

          {/* Right thumbnail - Daangn style positioning */}
          <div className="flex items-start gap-3 mt-2">
            <div className="flex-1">
              {/* Text-only image indicator for when images are hidden */}
              {!showImages && post.images && post.images.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-3 h-2 bg-zinc-300 rounded-sm flex items-center justify-center">
                    <div className="w-1.5 h-1 bg-zinc-500 rounded-sm" />
                  </div>
                  <span className="text-xs text-gray-500 font-normal">
                    사진 {post.images.length}장
                  </span>
                </div>
              )}
            </div>
            
            {/* Right thumbnail - ultra-compact like live Daangn */}
            {showImages && post.images && post.images.length > 0 && post.images[0].public_url && (
              <div className="flex-shrink-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={post.images[0].public_url}
                    alt={post.images[0].alt_text || "게시글 이미지"}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  {/* Multiple images indicator */}
                  {post.images.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-0.5 py-0.5 rounded-tl-sm font-normal leading-none">
                      +{post.images.length - 1}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Daangn-style engagement metrics */}
        <div className={cn(
          "flex items-center justify-between mt-3 pt-3 border-t border-gray-100",
          compact && "mt-2 pt-2" // Reduced spacing for compact mode
        )}>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User size={12} className="text-gray-400" />
            <span className="font-medium">
              {post.user?.name || "익명"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Views count */}
            {post.views_count !== undefined && post.views_count > 0 && (
              <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-daangn">
                <Eye size={12} className="text-gray-400" aria-label="조회수" />
                <span className="text-xs font-medium">
                  {post.views_count > 999 ? `${Math.floor(post.views_count / 1000)}k` : post.views_count}
                </span>
              </div>
            )}

            {/* Like button with Daangn styling */}
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
              showCount={true}
            />

            {/* Comments with Daangn styling */}
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-daangn">
              <MessageCircle size={12} className="text-gray-400" aria-label="댓글" />
              <span className="text-xs font-medium">
                {post.comments_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Action Indicators */}
      {gestureState.isActive && (
        <>
          {gestureState.direction === 'right' && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white rounded-full p-2 shadow-lg animate-pulse">
              <Heart size={16} fill="currentColor" />
            </div>
          )}
          {gestureState.direction === 'left' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-2 shadow-lg animate-pulse">
              <Share2 size={16} />
            </div>
          )}
        </>
      )}

      {/* Swipe Action Feedback */}
      {swipeAction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <div className={cn(
            "flex flex-col items-center gap-2 text-white animate-bounce",
            swipeAction === 'like' && "text-red-500",
            swipeAction === 'share' && "text-blue-500"
          )}>
            {swipeAction === 'like' ? (
              <Heart size={32} fill="currentColor" />
            ) : (
              <Share2 size={32} />
            )}
            <span className="text-sm font-medium">
              {swipeAction === 'like' ? '좋아요!' : '공유!'}
            </span>
          </div>
        </div>
      )}
    </article>
  );
});
