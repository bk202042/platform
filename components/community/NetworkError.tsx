"use client";

import React from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkErrorProps {
  type?: "offline" | "timeout" | "server" | "auth" | "generic";
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  className?: string;
}

const ERROR_CONFIG = {
  offline: {
    icon: <WifiOff className="h-12 w-12 text-red-500" />,
    title: "인터넷 연결이 끊어졌습니다",
    description: "네트워크 연결을 확인하고 다시 시도해주세요.",
    retryLabel: "다시 연결",
  },
  timeout: {
    icon: <RefreshCw className="h-12 w-12 text-amber-500" />,
    title: "요청 시간이 초과되었습니다",
    description: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
    retryLabel: "다시 시도",
  },
  server: {
    icon: <Server className="h-12 w-12 text-red-500" />,
    title: "서버 오류가 발생했습니다",
    description: "일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.",
    retryLabel: "다시 시도",
  },
  auth: {
    icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
    title: "인증 오류",
    description: "로그인이 필요하거나 세션이 만료되었습니다.",
    retryLabel: "로그인하기",
  },
  generic: {
    icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
    title: "오류가 발생했습니다",
    description: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
    retryLabel: "다시 시도",
  },
} as const;

export function NetworkError({
  type = "generic",
  title,
  description,
  onRetry,
  retryLabel,
  showRetry = true,
  className = "",
}: NetworkErrorProps) {
  const config = ERROR_CONFIG[type];

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayRetryLabel = retryLabel || config.retryLabel;

  // Check if user is online
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-detect offline state
  const effectiveType = !isOnline ? "offline" : type;
  const effectiveConfig = ERROR_CONFIG[effectiveType];

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="mb-6">
        {effectiveType === "offline" ? effectiveConfig.icon : config.icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {effectiveType === "offline" ? effectiveConfig.title : displayTitle}
      </h3>

      <p className="text-gray-600 mb-8 max-w-md">
        {effectiveType === "offline"
          ? effectiveConfig.description
          : displayDescription}
      </p>

      {/* Connection status indicator */}
      <div className="flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-gray-100">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">온라인</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">오프라인</span>
          </>
        )}
      </div>

      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          className="flex items-center gap-2"
          disabled={!isOnline && type !== "offline"}
        >
          <RefreshCw className="h-4 w-4" />
          {effectiveType === "offline"
            ? effectiveConfig.retryLabel
            : displayRetryLabel}
        </Button>
      )}

      {/* Additional help text for offline state */}
      {!isOnline && (
        <p className="text-xs text-gray-500 mt-4 max-w-sm">
          인터넷 연결이 복구되면 자동으로 다시 시도됩니다.
        </p>
      )}
    </div>
  );
}

// Specialized network error components
export function OfflineError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="offline" onRetry={onRetry} />;
}

export function TimeoutError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="timeout" onRetry={onRetry} />;
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return <NetworkError type="server" onRetry={onRetry} />;
}

export function AuthError({ onRetry }: { onRetry?: () => void }) {
  return (
    <NetworkError
      type="auth"
      onRetry={onRetry || (() => (window.location.href = "/auth/sign-in"))}
    />
  );
}

// Hook for handling network errors
export function useNetworkError() {
  const [error, setError] = React.useState<{
    type: NetworkErrorProps["type"];
    message?: string;
  } | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      // Detect error type based on error message or properties
      if (error.message.includes("fetch")) {
        setError({ type: "offline", message: error.message });
      } else if (error.message.includes("timeout")) {
        setError({ type: "timeout", message: error.message });
      } else if (
        error.message.includes("500") ||
        error.message.includes("server")
      ) {
        setError({ type: "server", message: error.message });
      } else if (
        error.message.includes("401") ||
        error.message.includes("auth")
      ) {
        setError({ type: "auth", message: error.message });
      } else {
        setError({ type: "generic", message: error.message });
      }
    } else {
      setError({ type: "generic" });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
