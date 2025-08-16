"use client";

import React, { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/community/ToastProvider";
import { useOptimisticLike } from "@/lib/hooks/useOptimisticUpdate";

export interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  disabled?: boolean;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  size = "md",
  showCount = true,
  disabled = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toggleLike, isLoading } = useOptimisticLike();
  const { user } = useAuth();
  const { showAuthError } = useToast();

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    if (!user) {
      showAuthError();
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    await toggleLike(
      postId,
      liked,
      count,
      (newLiked, newCount) => {
        setLiked(newLiked);
        setCount(newCount);
      },
      async () => {
        const response = await fetch(`/api/community/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "좋아요 처리에 실패했습니다.");
        }
        const result = await response.json();
        // The server returns the new state, which we can use to sync if needed,
        // but the optimistic hook handles the immediate UI update.
        return result.data;
      },
    );
  };

  const sizeConfig = {
    sm: { icon: 10, padding: "px-0 py-0", text: "text-xs" },
    md: { icon: 14, padding: "px-2 py-1", text: "text-sm" },
    lg: { icon: 16, padding: "px-3 py-2", text: "text-base" },
  };

  const config = sizeConfig[size];

  return (
    <button
      type="button"
      className={`
        flex items-center gap-1 rounded-lg transition-daangn select-none group/like touch-target
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus:ring-offset-0
        disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95
        ${config.padding}
        ${
          liked
            ? "text-[#007882] hover:text-[#006670]"
            : "text-gray-400 hover:text-[#007882]"
        }
        ${isAnimating ? "animate-bounce" : ""}
        ${isLoading ? "cursor-wait" : "cursor-pointer"}
      `}
      aria-label={liked ? "좋아요 취소하기" : "좋아요 누르기"}
      aria-describedby={showCount ? `like-count-${postId}` : undefined}
      onClick={handleToggle}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2
          size={config.icon}
          className="animate-spin text-[#007882]"
          aria-hidden="true"
        />
      ) : (
        <Heart
          size={config.icon}
          fill={liked ? "#FF8A3D" : "none"}
          strokeWidth={2.5}
          className={`transition-daangn ${isAnimating ? "animate-bounce scale-125" : ""} group-hover/like:scale-110`}
          aria-hidden="true"
        />
      )}

      {showCount && (
        <span
          id={`like-count-${postId}`}
          className={`text-xs font-medium transition-daangn ${liked ? "text-[#007882]" : "text-gray-500"} group-hover/like:text-[#007882]`}
          aria-label={`좋아요 ${count}개`}
          aria-live="polite"
        >
          {count}
        </span>
      )}

      {/* Screen reader only text for better accessibility */}
      <span className="sr-only">
        {liked ? "이미 좋아요를 눌렀습니다" : "좋아요를 누르지 않았습니다"}
        {showCount && `, 총 ${count}개의 좋아요`}
      </span>
    </button>
  );
}
