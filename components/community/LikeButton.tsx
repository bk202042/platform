'use client';

import React, { useState, useTransition } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  disabled?: boolean;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  size = 'md',
  showCount = true,
  disabled = false
}: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(initialCount);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  // Size configurations with mobile-optimized touch targets
  const sizeConfig = {
    sm: { icon: 14, padding: 'px-3 py-2 min-h-[44px]', text: 'text-xs' },
    md: { icon: 18, padding: 'px-4 py-2.5 min-h-[48px]', text: 'text-sm' },
    lg: { icon: 20, padding: 'px-5 py-3 min-h-[52px]', text: 'text-base' }
  };

  const config = sizeConfig[size];

  const handleToggle = async () => {
    if (disabled || isPending) return;

    // Check authentication first
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('로그인이 필요합니다', {
        description: '좋아요를 누르려면 먼저 로그인해주세요.',
        action: {
          label: '로그인',
          onClick: () => {
            window.location.href = '/auth/sign-in';
          }
        }
      });
      return;
    }

    // Store original values for rollback
    const originalLiked = liked;
    const originalCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsAnimating(true);

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/community/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || '좋아요 처리에 실패했습니다.');
        }

        // Show success feedback
        if (result.data.liked) {
          toast.success('좋아요를 눌렀습니다! ❤️');
        } else {
          toast.success('좋아요를 취소했습니다.');
        }

      } catch (error) {
        // Rollback optimistic update
        setLiked(originalLiked);
        setCount(originalCount);

        const errorMessage = error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.';

        toast.error('오류가 발생했습니다', {
          description: errorMessage,
          action: {
            label: '다시 시도',
            onClick: () => handleToggle()
          }
        });
      }
    });
  };

  return (
    <button
      type="button"
      className={`
        flex items-center gap-1.5 ${config.padding} rounded-lg transition-all duration-200 select-none
        focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${liked
          ? 'text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200'
          : 'text-gray-600 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 border border-gray-200 hover:border-pink-200'
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${isPending ? 'cursor-wait' : 'cursor-pointer'}
      `}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소하기' : '좋아요 누르기'}
      aria-describedby={showCount ? `like-count-${postId}` : undefined}
      onClick={handleToggle}
      disabled={disabled || isPending}
    >
      {isPending ? (
        <Loader2
          size={config.icon}
          className="animate-spin text-pink-500"
          aria-hidden="true"
        />
      ) : (
        <Heart
          size={config.icon}
          fill={liked ? '#ec4899' : 'none'}
          strokeWidth={2}
          className={`transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      )}

      {showCount && (
        <span
          id={`like-count-${postId}`}
          className={`${config.text} font-medium transition-colors duration-200`}
          aria-label={`좋아요 ${count}개`}
        >
          {count}
        </span>
      )}

      {/* Screen reader only text for better accessibility */}
      <span className="sr-only">
        {liked ? '이미 좋아요를 눌렀습니다' : '좋아요를 누르지 않았습니다'}
        {showCount && `, 총 ${count}개의 좋아요`}
      </span>
    </button>
  );
}
