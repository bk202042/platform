"use client";

import { useCallback, useRef, useState } from "react";

export interface GestureConfig {
  minDistance?: number;
  maxVerticalDistance?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  enableHaptic?: boolean;
}

export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export interface GestureState {
  swipeProgress: number;
  isActive: boolean;
  direction: "left" | "right" | "up" | "down" | null;
}

const DEFAULT_CONFIG: Required<Omit<GestureConfig, "onSwipeLeft" | "onSwipeRight" | "onSwipeUp" | "onSwipeDown" | "onPinch" | "onDoubleTap">> = {
  minDistance: 50,
  maxVerticalDistance: 50,
  velocityThreshold: 0.3,
  enableHaptic: true,
};

export function useMobileGestures(config: GestureConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const [gestureState, setGestureState] = useState<GestureState>({
    swipeProgress: 0,
    isActive: false,
    direction: null,
  });

  const triggerHapticFeedback = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    if (!mergedConfig.enableHaptic || typeof window === "undefined") return;
    
    // Use the Vibration API as fallback for haptic feedback
    if ("vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, [mergedConfig.enableHaptic]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;
    setGestureState({
      swipeProgress: 0,
      isActive: false,
      direction: null,
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.targetTouches[0];
    const currentTouch = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    touchEnd.current = currentTouch;

    const deltaX = currentTouch.x - touchStart.current.x;
    const deltaY = currentTouch.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine primary direction
    let direction: "left" | "right" | "up" | "down" | null = null;
    if (absDeltaX > absDeltaY) {
      direction = deltaX > 0 ? "right" : "left";
    } else {
      direction = deltaY > 0 ? "down" : "up";
    }

    // Calculate progress (0-1)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const progress = Math.min(distance / mergedConfig.minDistance, 1);

    // Update gesture state
    setGestureState({
      swipeProgress: progress,
      isActive: progress > 0.2,
      direction,
    });

    // Trigger light haptic feedback when gesture becomes active
    if (progress > 0.2 && !gestureState.isActive) {
      triggerHapticFeedback("light");
    }
  }, [mergedConfig.minDistance, gestureState.isActive, triggerHapticFeedback]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      setGestureState({
        swipeProgress: 0,
        isActive: false,
        direction: null,
      });
      return;
    }

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    // Check for double tap
    const now = Date.now();
    if (
      absDeltaX < 10 &&
      absDeltaY < 10 &&
      now - lastTap.current < 300 &&
      config.onDoubleTap
    ) {
      triggerHapticFeedback("medium");
      config.onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }

    // Reset gesture state
    setGestureState({
      swipeProgress: 0,
      isActive: false,
      direction: null,
    });

    // Process swipe gestures
    const isValidSwipe = velocity > mergedConfig.velocityThreshold || 
                        Math.max(absDeltaX, absDeltaY) > mergedConfig.minDistance;

    if (!isValidSwipe) return;

    // Horizontal swipes
    if (absDeltaX > absDeltaY && absDeltaY < mergedConfig.maxVerticalDistance) {
      if (deltaX > 0 && config.onSwipeRight) {
        triggerHapticFeedback("medium");
        config.onSwipeRight();
      } else if (deltaX < 0 && config.onSwipeLeft) {
        triggerHapticFeedback("medium");
        config.onSwipeLeft();
      }
    }
    // Vertical swipes
    else if (absDeltaY > absDeltaX && absDeltaX < mergedConfig.maxVerticalDistance) {
      if (deltaY > 0 && config.onSwipeDown) {
        triggerHapticFeedback("medium");
        config.onSwipeDown();
      } else if (deltaY < 0 && config.onSwipeUp) {
        triggerHapticFeedback("medium");
        config.onSwipeUp();
      }
    }
  }, [
    config,
    mergedConfig.velocityThreshold,
    mergedConfig.minDistance,
    mergedConfig.maxVerticalDistance,
    triggerHapticFeedback,
  ]);

  const gestureHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return {
    gestureHandlers,
    gestureState,
    triggerHapticFeedback,
  };
}