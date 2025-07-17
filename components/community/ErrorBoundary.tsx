'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        문제가 발생했습니다
      </h2>
      <p className="text-gray-600 mb-4 max-w-md">
        페이지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      {error && process.env.NODE_ENV === 'development' && (
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            오류 세부사항 (개발 모드)
          </summary>
          <pre className="text-xs text-red-600 bg-red-50 p-2 rounded border overflow-auto max-w-md">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <Button onClick={resetError} className="flex items-center gap-2">
        <RefreshCw size={16} />
        다시 시도
      </Button>
    </div>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  if (error) {
    throw error; // This will be caught by the nearest ErrorBoundary
  }

  return { handleError, resetError };
}
