"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  pullDistance?: number;
  refreshThreshold?: number;
  className?: string;
}

const PULL_DISTANCE = 100;
const REFRESH_THRESHOLD = 60;

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  pullDistance = PULL_DISTANCE,
  refreshThreshold = REFRESH_THRESHOLD,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Check if container is at the top
  const checkCanPull = useCallback(() => {
    if (!containerRef.current) return false;
    const scrollTop = containerRef.current.scrollTop;
    return scrollTop <= 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const canPullNow = checkCanPull();
    setCanPull(canPullNow);
    
    if (canPullNow) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, [disabled, isRefreshing, checkCanPull]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canPull || !isDragging.current || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance curve for natural feel
      const resistance = Math.max(0, 1 - deltaY / (pullDistance * 2));
      const offset = Math.min(deltaY * resistance, pullDistance);
      setPullOffset(offset);
    }
  }, [canPull, disabled, isRefreshing, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || !isDragging.current || disabled) {
      setPullOffset(0);
      isDragging.current = false;
      return;
    }

    isDragging.current = false;
    const shouldRefresh = pullOffset >= refreshThreshold;

    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullOffset(0);
  }, [canPull, disabled, pullOffset, refreshThreshold, isRefreshing, onRefresh]);

  // Reset pull state when scrolling starts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isDragging.current) return;
      setPullOffset(0);
      setCanPull(checkCanPull());
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [checkCanPull]);

  const pullProgress = pullOffset / refreshThreshold;
  const isReady = pullProgress >= 1;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out",
          "bg-gradient-to-b from-white to-transparent z-10",
          pullOffset > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: Math.max(0, pullOffset),
          transform: `translateY(${Math.max(0, pullOffset - 60)}px)`,
        }}
      >
        <div className="flex flex-col items-center justify-center py-2">
          {/* Daangn-style loading animation */}
          <div className="relative">
            {isRefreshing ? (
              // Active refresh spinner
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            ) : (
              // Pull indicator
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all duration-200",
                  isReady
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 bg-gray-50"
                )}
              >
                {/* Arrow that rotates based on pull progress */}
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center transition-transform duration-200",
                    isReady ? "rotate-180" : "rotate-0"
                  )}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={cn(
                      "transition-colors duration-200",
                      isReady ? "text-orange-500" : "text-gray-400"
                    )}
                  >
                    <path
                      d="M6 2V10M2 6L6 2L10 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="mt-2 text-xs font-medium text-center">
            {isRefreshing ? (
              <span className="text-orange-600">새로고침 중...</span>
            ) : isReady ? (
              <span className="text-orange-600">놓으면 새로고침</span>
            ) : (
              <span className="text-gray-500">아래로 당겨서 새로고침</span>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-1 w-8 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-orange-500 transition-all duration-100 ease-out",
                isReady && "bg-orange-600"
              )}
              style={{
                width: `${Math.min(100, pullProgress * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}