import React, { memo, useMemo, useCallback, useState } from "react";
import { MessageCircle, User, Eye, Heart, Share2, MapPin } from "lucide-react";
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

// Category badge configuration with Korean labels and exact Daangn semantic colors
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
    color: "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]",
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

  // Daangn-style list layout with complete design system implementation
  if (listMode) {
    return (
      <article
        className={cn(
          "group py-4 px-5 hover:bg-zinc-50 border-b border-zinc-100 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm touch-manipulation min-h-[44px]",
          "font-['Apple_SD_Gothic_Neo','Malgun_Gothic','-apple-system','BlinkMacSystemFont',sans-serif]"
        )}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start gap-3">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Header: Location + Category badges */}
            <div className="flex items-center gap-2 mb-2">
              {post.apartments && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                  <MapPin size={10} className="text-zinc-500 flex-shrink-0" />
                  <span className="font-medium truncate max-w-[120px]">
                    {post.apartments.cities?.name}
                  </span>
                </div>
              )}
              {categoryConfig && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                  categoryConfig.color
                )}>
                  <span className="text-xs">{categoryConfig.icon}</span>
                  {categoryConfig.label}
                </span>
              )}
              <ClientTimeDisplay
                dateString={post.created_at}
                className="text-xs text-zinc-400 ml-auto"
              />
            </div>
            
            {/* Content: Title */}
            <h3 className="text-sm font-medium text-zinc-900 leading-[1.25] mb-2 line-clamp-2 group-hover:text-[#007882] transition-all duration-200">
              {post.title || post.body}
            </h3>
            
            {/* Footer: Engagement metrics aligned right */}
            <div className="flex items-center justify-end text-xs text-zinc-400 space-x-3">
              {post.comments_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle size={12} className="text-zinc-400" />
                  <span className="font-normal">{post.comments_count}</span>
                </div>
              )}
              {post.likes_count > 0 && (
                <div className="flex items-center gap-1">
                  <Heart size={12} className="text-zinc-400" />
                  <span className="font-normal">{post.likes_count}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right thumbnail */}
          {showImages && post.images && post.images.length > 0 && post.images[0].public_url && (
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100">
                <Image
                  src={post.images[0].public_url}
                  alt={post.images[0].alt_text || "게시글 이미지"}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-tl-md font-normal leading-none">
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
        "group relative bg-white border border-zinc-100 rounded-xl hover:bg-zinc-50 hover:border-zinc-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out cursor-pointer overflow-hidden touch-manipulation active:bg-zinc-100 min-h-[44px]",
        "font-['Apple_SD_Gothic_Neo','Malgun_Gothic','-apple-system','BlinkMacSystemFont',sans-serif]",
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
        "p-5", // Daangn standard 20px padding
        compact && "p-4" // Reduced padding for compact mode
      )}>
        {/* Header: Location + Category + Timestamp - Daangn pattern */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.apartments && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100">
              <MapPin size={12} className="text-zinc-500 flex-shrink-0" />
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                {post.apartments.cities?.name}
              </span>
            </div>
          )}
          {categoryConfig && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200",
              categoryConfig.color
            )}>
              <span className="text-xs">{categoryConfig.icon}</span>
              {categoryConfig.label}
            </span>
          )}
          <ClientTimeDisplay
            dateString={post.created_at}
            className="text-xs text-zinc-400 ml-auto"
          />
        </div>

        {/* Content - Daangn typography and spacing */}
        <div className={cn(
          "space-y-3", // 12px spacing
          compact && "space-y-2" // 8px spacing for compact
        )}>
          {post.title && (
            <h3 className={cn(
              "text-base font-medium text-zinc-900 line-clamp-2 group-hover:text-[#007882] transition-all duration-200 leading-[1.25]", // Daangn line-height
              compact && "text-sm" // Smaller title for compact mode
            )}>
              {post.title}
            </h3>
          )}

          <p className={cn(
            "text-sm text-zinc-600 leading-[1.5] line-clamp-2 group-hover:text-zinc-700 transition-all duration-200", // Daangn line-height
            compact && "text-xs line-clamp-1" // Smaller text and single line for compact mode
          )}>
            {post.body}
          </p>

          {/* Image handling - Daangn style */}
          <div className="flex items-start gap-4 mt-2">
            <div className="flex-1">
              {/* Text-only image indicator for when images are hidden */}
              {!showImages && post.images && post.images.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-3 bg-zinc-200 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-1.5 bg-zinc-500 rounded-sm" />
                  </div>
                  <span className="text-xs text-zinc-500 font-normal">
                    사진 {post.images.length}장
                  </span>
                </div>
              )}
            </div>
            
            {/* Right thumbnail - Daangn 12px radius */}
            {showImages && post.images && post.images.length > 0 && post.images[0].public_url && (
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100">
                  <Image
                    src={post.images[0].public_url}
                    alt={post.images[0].alt_text || "게시글 이미지"}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  {post.images.length > 1 && (
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded-md font-normal leading-none">
                      +{post.images.length - 1}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Daangn engagement pattern */}
        <div className={cn(
          "flex items-center justify-between mt-4 pt-4 border-t border-zinc-100", // 16px spacing (Daangn standard)
          compact && "mt-3 pt-3" // 12px spacing for compact
        )}>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
              <User size={12} className="text-zinc-500" />
            </div>
            <span className="font-normal">
              {post.user?.name || "익명"}
            </span>
          </div>

          <div className="flex items-center gap-4"> {/* 16px gap between metrics */}
            {/* Views count */}
            {post.views_count !== undefined && post.views_count > 0 && (
              <div className="flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-all duration-200">
                <Eye size={14} className="text-zinc-400" aria-label="조회수" />
                <span className="text-xs font-normal">
                  {post.views_count > 999 ? `${Math.floor(post.views_count / 1000)}k` : post.views_count}
                </span>
              </div>
            )}

            {/* Like button */}
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialCount={post.likes_count}
              size="sm"
              showCount={true}
            />

            {/* Comments */}
            <div className="flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-all duration-200 min-w-[44px] min-h-[44px] -m-2 p-2 rounded-lg hover:bg-zinc-50">
              <MessageCircle size={14} className="text-zinc-400" aria-label="댓글" />
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
