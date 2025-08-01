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
}

// Category badge configuration with Korean labels and Daangn-style colors
const CATEGORY_CONFIG = {
  QNA: {
    label: "Q&A",
    color: "bg-blue-50 text-blue-600 border border-blue-200",
    icon: "💬"
  },
  RECOMMEND: {
    label: "추천",
    color: "bg-green-50 text-green-600 border border-green-200",
    icon: "👍"
  },
  SECONDHAND: {
    label: "중고거래",
    color: "bg-orange-50 text-orange-600 border border-orange-200",
    icon: "🛍️"
  },
  FREE: {
    label: "나눔",
    color: "bg-purple-50 text-purple-600 border border-purple-200",
    icon: "🎁"
  },
} as const;

export const PostCard = memo(function PostCard({
  post,
  onClick,
  showImages = true,
  compact = false,
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

  return (
    <article
      className={cn(
        "group relative bg-white border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-200 cursor-pointer overflow-hidden touch-manipulation active:bg-zinc-100",
        gestureState.isActive && gestureState.direction === 'right' && "bg-red-50",
        gestureState.isActive && gestureState.direction === 'left' && "bg-blue-50",
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
        {/* Header with category and location - enhanced Daangn style */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryConfig && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${categoryConfig.color} group-hover:scale-105 transition-transform duration-200`}
              >
                <span className="text-xs">{categoryConfig.icon}</span>
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
          <ClientTimeDisplay
            dateString={post.created_at}
            className="text-xs text-zinc-400 flex-shrink-0 group-hover:text-zinc-600 transition-colors duration-200"
          />
        </div>

        {/* Content - enhanced Daangn-style layout */}
        <div className={cn(
          "space-y-2",
          compact && "space-y-1" // Reduced spacing for compact mode
        )}>
          {post.title && (
            <h3 className={cn(
              "text-base font-semibold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200 group-active:text-orange-700",
              compact && "text-sm" // Smaller title for compact mode
            )}>
              {post.title}
            </h3>
          )}

          <p className={cn(
            "text-sm text-zinc-600 leading-normal line-clamp-2 group-hover:text-zinc-700 transition-colors duration-200",
            compact && "text-xs line-clamp-1" // Smaller text and single line for compact mode
          )}>
            {post.body}
          </p>

          {/* Image display - conditionally shown based on showImages prop */}
          {showImages && post.images && post.images.length > 0 && (
            <div className="mt-3">
              {post.images.length === 1 ? (
                /* Single image - full width */
                post.images[0].public_url ? (
                  <div className="relative rounded-lg overflow-hidden bg-zinc-100 aspect-[4/3]">
                    <Image
                      src={post.images[0].public_url}
                      alt={post.images[0].alt_text || "게시글 이미지"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : null
              ) : post.images.length === 2 ? (
                /* Two images - side by side */
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 2).map((image, index) => 
                    image.public_url ? (
                      <div key={image.id || index} className="relative rounded-lg overflow-hidden bg-zinc-100 aspect-square">
                        <Image
                          src={image.public_url}
                          alt={image.alt_text || `게시글 이미지 ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        />
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                /* Multiple images - grid layout with counter */
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 3).map((image, index) => 
                    image.public_url ? (
                      <div 
                        key={image.id || index} 
                        className={`relative rounded-lg overflow-hidden bg-zinc-100 aspect-square ${
                          index === 0 && post.images && post.images.length > 2 ? 'row-span-2' : ''
                        }`}
                      >
                        <Image
                          src={image.public_url}
                          alt={image.alt_text || `게시글 이미지 ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        />
                        {/* Show "+N more" overlay on last visible image if there are more */}
                        {index === 2 && post.images && post.images.length > 3 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              +{post.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {/* Image count indicator */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-4 h-3 bg-zinc-200 rounded-sm flex items-center justify-center group-hover:bg-zinc-300 transition-colors duration-200">
                  <div className="w-2 h-1.5 bg-zinc-400 rounded-sm group-hover:bg-zinc-500 transition-colors duration-200" />
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-600 transition-colors duration-200">
                  사진 {post.images.length}장
                </span>
              </div>
            </div>
          )}

          {/* Text-only image indicator for when images are hidden */}
          {!showImages && post.images && post.images.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-3 h-2 bg-zinc-300 rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1 bg-zinc-500 rounded-sm" />
              </div>
              <span className="text-xs text-zinc-400">
                사진 {post.images.length}장
              </span>
            </div>
          )}
        </div>

        {/* Footer - enhanced engagement metrics */}
        <div className={cn(
          "flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 group-hover:border-zinc-200 transition-colors duration-200",
          compact && "mt-2 pt-2" // Reduced spacing for compact mode
        )}>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <User size={12} className="text-zinc-400" />
            <span className="font-medium group-hover:text-zinc-600 transition-colors duration-200">
              {post.user?.name || "익명"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Views count */}
            {post.views_count !== undefined && post.views_count > 0 && (
              <div className="flex items-center gap-1 text-zinc-500">
                <Eye size={12} className="text-zinc-400" aria-label="조회수" />
                <span className="text-xs font-medium">
                  {post.views_count > 999 ? `${Math.floor(post.views_count / 1000)}k` : post.views_count}
                </span>
              </div>
            )}

            {/* Like button with enhanced styling */}
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
              showCount={true}
            />

            {/* Comments with enhanced styling */}
            <div className="flex items-center gap-1 text-zinc-500 group-hover:text-orange-500 transition-colors duration-200">
              <MessageCircle size={12} className="text-zinc-400 group-hover:text-orange-400 transition-colors duration-200" aria-label="댓글" />
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
