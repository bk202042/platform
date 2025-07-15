import React from 'react';
import { Heart } from 'lucide-react';

export interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

export function LikeButton({ liked, count, onToggle }: LikeButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors select-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${liked ? 'text-pink-600 bg-pink-50' : 'text-gray-500 bg-gray-100 hover:bg-pink-100'}`}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      onClick={onToggle}
    >
      <Heart size={18} fill={liked ? '#ec4899' : 'none'} strokeWidth={2} />
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}
