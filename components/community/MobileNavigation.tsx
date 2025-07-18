"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Menu, X, Home, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CommunityCategory } from "@/lib/validation/community";

interface MobileNavigationProps {
  showBackButton?: boolean;
  title?: string;
  onBack?: () => void;
  showMenu?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Category labels in Korean
const CATEGORY_LABELS = {
  QNA: "Q&A",
  RECOMMEND: "추천",
  SECONDHAND: "중고거래",
  FREE: "나눔",
} as const;

export function MobileNavigation({
  showBackButton = false,
  title,
  onBack,
  showMenu = true,
  className,
  children,
}: MobileNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle back navigation with smart routing
  const handleBackNavigation = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback based on current path
      if (pathname.startsWith("/community/")) {
        // From post detail, go back to community with preserved filters
        const currentFilters = {
          category: searchParams.get("category"),
          apartmentId: searchParams.get("apartmentId"),
          sort: searchParams.get("sort"),
        };

        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });

        const filterUrl = params.toString();
        router.push(`/community${filterUrl ? `?${filterUrl}` : ""}`);
      } else {
        router.push("/");
      }
    }
  }, [onBack, router, pathname, searchParams]);

  // Enhanced swipe gesture handling with visual feedback
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setTouchEnd(null);
    setSwipeProgress(0);
    setIsSwipeActive(false);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.targetTouches[0];
      const currentTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setTouchEnd(currentTouch);

      // Calculate swipe progress for visual feedback
      const deltaX = currentTouch.x - touchStart.x;
      const deltaY = Math.abs(currentTouch.y - touchStart.y);

      // Only consider horizontal swipes (ignore if too much vertical movement)
      if (deltaY < 50) {
        const progress = Math.abs(deltaX) / 150; // Normalize to 0-1
        setSwipeProgress(Math.min(progress, 1));

        // Activate swipe feedback when movement is significant
        if (Math.abs(deltaX) > 20) {
          setIsSwipeActive(true);
        }
      }
    },
    [touchStart],
  );

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsSwipeActive(false);
      setSwipeProgress(0);
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);
    const deltaTime = touchEnd.time - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;

    // Reset visual feedback
    setIsSwipeActive(false);
    setSwipeProgress(0);

    // Only process horizontal swipes
    if (deltaY > 50) return;

    const distance = Math.abs(deltaX);
    const minDistance = 50;
    const velocityThreshold = 0.5;
    const isLeftSwipe = deltaX < -minDistance;
    const isRightSwipe = deltaX > minDistance;
    const isFastSwipe = velocity > velocityThreshold;
    const isLongSwipe = distance > minDistance;

    // Right swipe for back navigation (only if back button is shown)
    if (isRightSwipe && showBackButton && (isFastSwipe || isLongSwipe)) {
      handleBackNavigation();
    }

    // Left swipe to open menu (only if menu is available)
    if (
      isLeftSwipe &&
      showMenu &&
      !isMenuOpen &&
      (isFastSwipe || isLongSwipe)
    ) {
      setIsMenuOpen(true);
    }
  }, [
    touchStart,
    touchEnd,
    showBackButton,
    showMenu,
    isMenuOpen,
    handleBackNavigation,
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Get current page context for title
  const getPageTitle = () => {
    if (title) return title;

    const category = searchParams.get("category") as CommunityCategory;
    if (category && CATEGORY_LABELS[category]) {
      return CATEGORY_LABELS[category];
    }

    if (pathname === "/community") return "커뮤니티";
    if (pathname.startsWith("/community/")) return "게시글";

    return "커뮤니티";
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div
        ref={navRef}
        className={cn(
          "md:hidden sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm transition-transform duration-200",
          isSwipeActive && swipeProgress > 0.1 && "transform",
          className,
        )}
        style={{
          transform:
            isSwipeActive && showBackButton && swipeProgress > 0
              ? `translateX(${Math.min(swipeProgress * 20, 20)}px)`
              : undefined,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="navigation"
        aria-label="모바일 내비게이션 바"
      >
        {/* Swipe indicator */}
        {isSwipeActive && swipeProgress > 0.2 && showBackButton && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 opacity-60">
            <ArrowLeft size={16} className="text-blue-500" />
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 -ml-2 min-h-[44px] min-w-[44px]"
                aria-label="뒤로 가기"
              >
                <ArrowLeft size={20} />
              </Button>
            )}

            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {children}

            {showMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px]"
                aria-label="메뉴 열기"
              >
                <Menu size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            role="navigation"
            aria-label="모바일 메뉴"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px]"
                aria-label="메뉴 닫기"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-4">
              {/* Quick Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  빠른 이동
                </h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 h-auto min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    onClick={() => {
                      router.push("/");
                      setIsMenuOpen(false);
                    }}
                    tabIndex={0}
                    autoFocus
                  >
                    <Home size={18} className="mr-3" />홈
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 h-auto min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    onClick={() => {
                      router.push("/community");
                      setIsMenuOpen(false);
                    }}
                    tabIndex={0}
                  >
                    <MessageSquare size={18} className="mr-3" />
                    커뮤니티
                  </Button>
                </div>
              </div>

              {/* Category Filters (only show on community pages) */}
              {pathname.startsWith("/community") && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    카테고리
                  </h3>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-3 h-auto min-h-[44px]"
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete("category");
                        router.push(`/community?${params.toString()}`);
                        setIsMenuOpen(false);
                      }}
                    >
                      전체
                    </Button>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left p-3 h-auto min-h-[44px]",
                          searchParams.get("category") === key.toLowerCase() &&
                            "bg-blue-50 text-blue-600",
                        )}
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          params.set("category", key.toLowerCase());
                          router.push(`/community?${params.toString()}`);
                          setIsMenuOpen(false);
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
