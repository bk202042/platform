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

// Category badge configuration with Korean labels and ultra-subtle Daangn-style colors
const CATEGORY_CONFIG = {
  QNA: {
    label: "Q&A",
    color: "bg-blue-25 text-blue-600 border border-blue-50",
    icon: "💬"
  },
  RECOMMEND: {
    label: "추천",
    color: "bg-green-25 text-green-600 border border-green-50",
    icon: "👍"
  },
  SECONDHAND: {
    label: "중고거래",
    color: "bg-orange-25 text-orange-600 border border-orange-50",
    icon: "🛍️"
  },
  FREE: {
    label: "나눔",
    color: "bg-purple-25 text-purple-600 border border-purple-50",
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
        className="group py-2.5 px-4 hover:bg-gray-25 border-b border-gray-50 cursor-pointer transition-colors duration-200"
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
            <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
                  <span className="mx-1 text-gray-400">·</span>
                </>
              )}
              
              {/* Time */}
              <ClientTimeDisplay
                dateString={post.created_at}
                className="text-xs font-light text-gray-400"
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
        "group relative bg-white border-b border-gray-100 hover:bg-gray-25 transition-all duration-200 cursor-pointer overflow-hidden touch-manipulation active:bg-gray-50",
        gestureState.isActive && gestureState.direction === 'right' && "bg-red-25",
        gestureState.isActive && gestureState.direction === 'left' && "bg-blue-25",
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
        {/* Header with category and location - ultra-minimal Daangn style */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categoryConfig && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-normal ${categoryConfig.color} transition-colors duration-200`}
              >
                <span className="text-xs">{categoryConfig.icon}</span>
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span className="truncate max-w-[120px] sm:max-w-none font-semibold text-gray-700">
                  {post.apartments.cities?.name} {post.apartments.name}
                </span>
              </span>
            )}
          </div>
          <ClientTimeDisplay
            dateString={post.created_at}
            className="text-xs text-gray-400 flex-shrink-0 font-normal"
          />
        </div>

        {/* Content - enhanced Daangn-style layout */}
        <div className={cn(
          "space-y-2",
          compact && "space-y-1" // Reduced spacing for compact mode
        )}>
          {post.title && (
            <h3 className={cn(
              "text-base font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200",
              compact && "text-sm" // Smaller title for compact mode
            )}>
              {post.title}
            </h3>
          )}

          <p className={cn(
            "text-sm text-gray-600 leading-relaxed line-clamp-2 font-normal transition-colors duration-200",
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

        {/* Footer - ultra-subtle engagement metrics */}
        <div className={cn(
          "flex items-center justify-between mt-2 pt-2 border-t border-gray-50",
          compact && "mt-1.5 pt-1.5" // Reduced spacing for compact mode
        )}>
          <div className="flex items-center gap-0.5 text-xs text-gray-400">
            <User size={10} className="text-gray-300" />
            <span className="font-normal">
              {post.user?.name || "익명"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Views count */}
            {post.views_count !== undefined && post.views_count > 0 && (
              <div className="flex items-center gap-0.5 text-gray-300">
                <Eye size={10} className="text-gray-300" aria-label="조회수" />
                <span className="text-xs font-normal">
                  {post.views_count > 999 ? `${Math.floor(post.views_count / 1000)}k` : post.views_count}
                </span>
              </div>
            )}

            {/* Like button with ultra-subtle styling */}
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
              showCount={true}
            />

            {/* Comments with ultra-subtle styling */}
            <div className="flex items-center gap-0.5 text-gray-300">
              <MessageCircle size={10} className="text-gray-300" aria-label="댓글" />
              <span className="text-xs font-normal">
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
