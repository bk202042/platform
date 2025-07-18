"use client";

import React from "react";
import { Loader2, User, Shield, CheckCircle } from "lucide-react";

interface AuthLoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function AuthLoadingState({
  message = "인증 상태를 확인하는 중...",
  size = "md",
  showIcon = true,
  className = "",
}: AuthLoadingStateProps) {
  const sizeConfig = {
    sm: { spinner: "h-4 w-4", text: "text-sm", padding: "py-4" },
    md: { spinner: "h-6 w-6", text: "text-base", padding: "py-6" },
    lg: { spinner: "h-8 w-8", text: "text-lg", padding: "py-8" },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex flex-col items-center justify-center ${config.padding} ${className}`}
    >
      {showIcon && (
        <Loader2
          className={`${config.spinner} animate-spin text-primary mb-3`}
        />
      )}
      <p className={`${config.text} text-gray-600 font-medium text-center`}>
        {message}
      </p>
    </div>
  );
}

// Specialized loading states for different authentication scenarios
export function SignInLoadingState() {
  return <AuthLoadingState message="로그인 중..." size="md" />;
}

export function SignOutLoadingState() {
  return <AuthLoadingState message="로그아웃 중..." size="md" />;
}

export function SessionValidationLoadingState() {
  return <AuthLoadingState message="세션을 확인하는 중..." size="sm" />;
}

export function PermissionCheckLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <Shield className="h-6 w-6 animate-pulse text-blue-500 mb-3" />
      <p className="text-base text-gray-600 font-medium text-center">
        권한을 확인하는 중...
      </p>
    </div>
  );
}

// Skeleton loading states for authentication-dependent content
export function AuthContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

// Loading overlay for authentication actions
export function AuthLoadingOverlay({
  show,
  message = "처리 중...",
  onCancel,
}: {
  show: boolean;
  message?: string;
  onCancel?: () => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-800 font-medium mb-4 text-center">
            {message}
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Progressive loading states that show different stages
export function ProgressiveAuthLoading({
  stage,
  stages = [
    { key: "checking", label: "인증 상태 확인 중...", icon: User },
    { key: "validating", label: "세션 검증 중...", icon: Shield },
    { key: "complete", label: "인증 완료", icon: CheckCircle },
  ],
}: {
  stage: string;
  stages?: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}) {
  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="space-y-4 w-full max-w-xs">
        {stages.map((stageItem, index) => {
          const Icon = stageItem.icon;
          const isActive = index === currentStageIndex;
          const isComplete = index < currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <div
              key={stageItem.key}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                isActive
                  ? "opacity-100"
                  : isPending
                    ? "opacity-40"
                    : "opacity-70"
              }`}
            >
              <div
                className={`flex-shrink-0 ${isActive ? "animate-pulse" : ""}`}
              >
                {isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${
                      isComplete ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-gray-900"
                    : isComplete
                      ? "text-green-700"
                      : "text-gray-500"
                }`}
              >
                {stageItem.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for managing authentication loading states
export function useAuthLoadingState() {
  const [loadingState, setLoadingState] = React.useState<{
    isLoading: boolean;
    message: string;
    stage?: string;
  }>({
    isLoading: false,
    message: "",
    stage: undefined,
  });

  const startLoading = React.useCallback((message: string, stage?: string) => {
    setLoadingState({
      isLoading: true,
      message,
      stage,
    });
  }, []);

  const updateLoading = React.useCallback((message: string, stage?: string) => {
    setLoadingState((prev) => ({
      ...prev,
      message,
      stage: stage ?? prev.stage,
    }));
  }, []);

  const stopLoading = React.useCallback(() => {
    setLoadingState({
      isLoading: false,
      message: "",
      stage: undefined,
    });
  }, []);

  return {
    ...loadingState,
    startLoading,
    updateLoading,
    stopLoading,
  };
}
