'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Wifi, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileErrorStateProps {
  type?: 'network' | 'not-found' | 'server' | 'general';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function MobileErrorState({
  type = 'general',
  title,
  message,
  onRetry,
  onBack,
  showBackButton = false,
  className
}: MobileErrorStateProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi size={48} className="text-gray-400" />,
          title: title || '연결 오류',
          message: message || '인터넷 연결을 확인하고 다시 시도해주세요.',
          actionText: '다시 시도'
        };

      case 'not-found':
        return {
          icon: <MessageSquare size={48} className="text-gray-400" />,
          title: title || '게시글을 찾을 수 없습니다',
          message: message || '요청하신 게시글이 삭제되었거나 존재하지 않습니다.',
          actionText: '목록으로 돌아가기'
        };

      case 'server':
        return {
          icon: <AlertCircle size={48} className="text-red-400" />,
          title: title || '서버 오류',
          message: message || '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          actionText: '다시 시도'
        };

      default:
        return {
          icon: <AlertCircle size={48} className="text-gray-400" />,
          title: title || '오류가 발생했습니다',
          message: message || '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
          actionText: '다시 시도'
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className={cn("md:hidden", className)}>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
        {/* Error Icon */}
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
          {errorContent.icon}
        </div>

        {/* Error Text */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {errorContent.title}
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-sm">
            {errorContent.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full flex items-center gap-2 min-h-[48px]"
              size="lg"
            >
              <RefreshCw size={18} />
              {errorContent.actionText}
            </Button>
          )}

          {showBackButton && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full flex items-center gap-2 min-h-[48px]"
              size="lg"
            >
              <ArrowLeft size={18} />
              뒤로 가기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific error components for different use cases
export function MobileNetworkError({
  onRetry,
  className
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <MobileErrorState
      type="network"
      onRetry={onRetry}
      className={className}
    />
  );
}

export function MobileNotFoundError({
  onBack,
  className
}: {
  onBack?: () => void;
  className?: string;
}) {
  return (
    <MobileErrorState
      type="not-found"
      onBack={onBack}
      showBackButton={true}
      className={className}
    />
  );
}

export function MobileServerError({
  onRetry,
  className
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <MobileErrorState
      type="server"
      onRetry={onRetry}
      className={className}
    />
  );
}
