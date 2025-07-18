'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                문제가 발생했습니다
              </h2>
              <p className="text-gray-600 mb-6">
                페이지를 불러오는 중에 오류가 발생했습니다.
                잠시 후 다시 시도해주세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  홈으로 이동
                </Link>
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  개발자 정보 (개발 환경에서만 표시)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Specific error boundary for authentication errors
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  onAuthError?: () => void;
}

export function AuthErrorBoundary({ children, onAuthError }: AuthErrorBoundaryProps) {
  const handleError = (error: Error) => {
    // Check if it's an authentication-related error
    if (
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('login') ||
      error.message.includes('session')
    ) {
      onAuthError?.();
    }
  };

  const AuthErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          인증 오류
        </h3>
        <p className="text-gray-600 mb-6">
          로그인 상태를 확인할 수 없습니다.
          다시 로그인해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={retry} variant="outline">
            다시 시도
          </Button>
          <Button asChild>
            <Link href="/auth/sign-in">
              로그인하기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={AuthErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
