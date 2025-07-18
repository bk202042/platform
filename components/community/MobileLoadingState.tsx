'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface MobileLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  className?: string;
}

export function MobileLoadingState({
  message = '로딩 중...',
  size = 'md',
  showMessage = true,
  className = ''
}: MobileLoadingStateProps) {
  const sizeConfig = {
    sm: { spinner: 'h-4 w-4', text: 'text-xs', padding: 'py-4' },
    md: { spinner: 'h-6 w-6', text: 'text-sm', padding: 'py-6' },
    lg: { spinner: 'h-8 w-8', text: 'text-base', padding: 'py-8' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center ${config.padding} ${className}`}>
      <Loader2 className={`${config.spinner} animate-spin text-primary mb-2`} />
      {showMessage && (
        <p className={`${config.text} text-gray-600 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
}

// Specialized loading states
export function MobilePostsLoading() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileCommentsLoading() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileFormLoading({ message = '저장 중...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-xs w-full">
        <MobileLoadingState message={message} size="md" />
      </div>
    </div>
  );
}

// Loading overlay for mobile interactions
export function MobileLoadingOverlay({
  show,
  message = '처리 중...'
}: {
  show: boolean;
  message?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-4 mx-4 shadow-lg">
        <MobileLoadingState message={message} size="sm" />
      </div>
    </div>
  );
}
