import React from 'react';
import { Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  type?: 'network' | 'server' | 'timeout' | 'generic';
}

const ERROR_CONFIG = {
  network: {
    icon: <Wifi className="w-12 h-12 text-red-500" />,
    title: '인터넷 연결을 확인해주세요',
    description: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
  },
  server: {
    icon: <AlertCircle className="w-12 h-12 text-red-500" />,
    title: '서버 오류가 발생했습니다',
    description: '일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  timeout: {
    icon: <RefreshCw className="w-12 h-12 text-red-500" />,
    title: '요청 시간이 초과되었습니다',
    description: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  },
  generic: {
    icon: <AlertCircle className="w-12 h-12 text-red-500" />,
    title: '오류가 발생했습니다',
    description: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
};

export function NetworkError({
  title,
  description,
  onRetry,
  showRetryButton = true,
  type = 'generic',
}: NetworkErrorProps) {
  const config = ERROR_CONFIG[type];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-red-200 shadow-sm">
      <div className="mb-4">
        {config.icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md text-sm sm:text-base">
        {displayDescription}
      </p>

      {showRetryButton && onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw size={16} />
          다시 시도
        </Button>
      )}
    </div>
  );
}

// Specialized network error components
export function ConnectionError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="network" onRetry={onRetry} />;
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="server" onRetry={onRetry} />;
}

export function TimeoutError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="timeout" onRetry={onRetry} />;
}

// Hook for handling different types of errors
export function useErrorType(error: Error | null) {
  if (!error) return null;

  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }

  if (message.includes('timeout')) {
    return 'timeout';
  }

  if (message.includes('server') || message.includes('500') || message.includes('502') || message.includes('503')) {
    return 'server';
  }

  return 'generic';
}
