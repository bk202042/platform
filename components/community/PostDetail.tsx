import React from 'react';
import Image from 'next/image';
import { MessageCircle, Clock, User, MapPin } from 'lucide-react';
import { CommunityCategory } from '@/lib/validation/community';
import { LikeButton } from './LikeButton';

export interface PostDetailProps {
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
}

// Category badge configuration with Korean labels and colors
const CATEGORY_CONFIG = {
  QNA: { label: 'Q&A', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  RECOMMEND: { label: '추천', color: 'bg-green-100 text-green-800 border-green-200' },
  SECONDHAND: { label: '중고거래', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  FREE: { label: '나눔', color: 'bg-purple-100 text-purple-800 border-purple-200' },
} as const;

export function PostDetail({ post }: PostDetailProps) {
  const categoryConfig = post.category ? CATEGORY_CONFIG[post.category] : null;

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-3 xs:p-4 sm:p-6 md:p-8">
        {/* Header with category badge and location */}
        <div className="flex items-start justify-between gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6">
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 flex-wrap">
            {categoryConfig && (
              <span className={`inline-flex items-center px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-medium border ${categoryConfig.color}`}>
                {categoryConfig.label}
              </span>
            )}
            {post.apartments && (
              <div className="flex items-center gap-1 xs:gap-1.5 text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full">
                <MapPin size={10} className="text-gray-400 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                <span className="truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                  <span className="hidden sm:inline">{post.apartments.cities?.name} · </span>
                  {post.apartments.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-5 leading-tight xs:leading-tight sm:leading-normal">
            {post.title}
          </h1>
        )}

        {/* Author and date info */}
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6 pb-3 xs:pb-4 sm:pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-xs xs:text-sm text-gray-600">
            <User size={12} className="text-gray-400 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
            <span className="font-medium">{post.user?.name || '익명'}</span>
          </div>
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-xs xs:text-sm text-gray-500">
            <Clock size={12} className="text-gray-400 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs xs:text-sm">{formatDate(post.created_at)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <div className="text-gray-800 leading-relaxed whitespace-pre-line text-sm xs:text-base sm:text-lg md:text-xl">
            {post.body}
          </div>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 xs:mb-5 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`게시글 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {index === 3 && post.images!.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <span className="text-white font-semibold text-xs xs:text-sm sm:text-lg">
                        +{post.images!.length - 4}개 더
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement metrics */}
        <div className="flex items-center gap-3 xs:gap-4 sm:gap-6 pt-3 xs:pt-4 sm:pt-5 border-t border-gray-100">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked || false}
            initialCount={post.likes_count}
            size="lg"
          />
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-gray-600">
            <MessageCircle size={16} className="text-gray-400 xs:w-4 xs:h-4 sm:w-5 sm:h-5" aria-label="댓글" />
            <span className="font-medium text-sm xs:text-base">{post.comments_count}</span>
            <span className="text-xs xs:text-sm text-gray-500">댓글</span>
          </div>
        </div>
      </div>
    </article>
  );
}
