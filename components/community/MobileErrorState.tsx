"use client";

import React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MobileErrorStateProps {
  type?: "network" | "auth" | "generic";
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export function MobileErrorState({
  type = "generic",
  title,
  description,
  onRetry,
  showHomeButton = true,
  className = "",
}: MobileErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: <WifiOff className="h-8 w-8 text-red-500" />,
          title: title || "연결 오류",
          description: description || "인터넷 연결을 확인해주세요",
          actionLabel: "다시 시도",
        };
      case "auth":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          title: title || "로그인 필요",
          description:
            description || "이 기능을 사용하려면 로그인이 필요합니다",
          actionLabel: "로그인하기",
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-gray-500" />,
          title: title || "오류 발생",
          description: description || "문제가 발생했습니다",
          actionLabel: "다시 시도",
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div
      className={`flex flex-col items-center justify-center py-8 px-4 text-center min-h-[200px] ${className}`}
    >
      <div className="mb-4">{config.icon}</div>

      <h3 className="text-base font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>

      <p className="text-sm text-gray-600 mb-6 max-w-xs">
        {config.description}
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 w-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            {config.actionLabel}
          </Button>
        )}

        {type === "auth" && !onRetry && (
          <Button asChild className="w-full" size="sm">
            <Link href="/auth/sign-in">로그인하기</Link>
          </Button>
        )}

        {showHomeButton && (
          <Button variant="outline" asChild className="w-full" size="sm">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              홈으로 이동
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// Specialized mobile error components
export function MobileNetworkError({ onRetry }: { onRetry?: () => void }) {
  return <MobileErrorState type="network" onRetry={onRetry} />;
}

export function MobileAuthError({ onRetry }: { onRetry?: () => void }) {
  return <MobileErrorState type="auth" onRetry={onRetry} />;
}

export function MobileGenericError({
  title,
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <MobileErrorState
      type="generic"
      title={title}
      description={description}
      onRetry={onRetry}
    />
  );
}
