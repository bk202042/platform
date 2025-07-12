import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

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
  };
  onClick?: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <div
      className="flex flex-row md:flex-row items-stretch rounded-xl shadow-[0_4px_24px_rgba(60,60,100,0.08)] bg-white border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer p-4 mb-4 max-w-full"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={post.title || post.body.slice(0, 20)}
    >
      {/* 텍스트 영역 */}
      <div className={post.images && post.images.length > 0 ? 'flex-1 pr-4' : 'flex-1'}>
        {post.title && (
          <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{post.title}</h2>
        )}
        <p className="text-gray-700 text-sm mb-2 line-clamp-2">{post.body}</p>
        <div className="flex items-center text-xs text-gray-400 gap-2 mt-2">
          <span>{post.user?.name || '익명'}</span>
          <span aria-hidden="true">·</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-gray-500">
            <Heart size={16} className="mr-1" aria-label="좋아요" />
            <span>{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MessageCircle size={16} className="mr-1" aria-label="댓글" />
            <span>{post.comments_count}</span>
          </div>
        </div>
      </div>
      {/* 이미지 영역 삭제: 이미지가 있어도 렌더링하지 않음 */}
      {/*
      {post.images && post.images.length > 0 && (
        <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ml-2">
          <img
            src={post.images[0]}
            alt="게시글 이미지"
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      )}
      */}
    </div>
  );
}
