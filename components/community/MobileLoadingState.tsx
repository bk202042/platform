'use client';

import React from 'react';
import { Loader2, MessageSquare, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLoadingStateProps {
  type?: 'posts' | 'post-detail' | 'comments' | 'general';
  message?: string;
  className?: string;
}

export function MobileLoadingState({
  type = 'general',
  message,
  className
}: MobileLoadingStateProps) {
  const getLoadingContent = () => {
    switch (type) {
      case 'posts':
        return (
          <div className="space-y-4">
            {/* Post skeleton cards optimized for mobile */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-2 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1">
                    <Heart size={14} className="text-gray-300" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-gray-300" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'post-detail':
        return (
          <div className="space-y-6">
            {/* Post header skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Comments skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex gap-3 p-3 border-l-2 border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'comments':
        return (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-gray-600 text-center">
              {message || '로딩 중...'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className={cn("md:hidden", className)}>
      {getLoadingContent()}
    </div>
  );
}

// Specific loading components for different use cases
export function MobilePostsLoading({ className }: { className?: string }) {
  return <MobileLoadingState type="posts" className={className} />;
}

export function MobilePostDetailLoading({ className }: { className?: string }) {
  return <MobileLoadingState type="post-detail" className={className} />;
}

export function MobileCommentsLoading({ className }: { className?: string }) {
  return <MobileLoadingState type="comments" className={className} />;
}
