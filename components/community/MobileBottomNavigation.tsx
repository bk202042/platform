"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, MessageSquare, Search, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileBottomNavigationProps {
  onCreatePost?: () => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "홈",
    icon: <Home size={20} />,
    path: "/",
    isActive: (pathname) => pathname === "/",
  },
  {
    id: "search",
    label: "검색",
    icon: <Search size={20} />,
    path: "/search",
    isActive: (pathname) => pathname.startsWith("/search"),
  },
  {
    id: "community",
    label: "커뮤니티",
    icon: <MessageSquare size={20} />,
    path: "/community",
    isActive: (pathname) => pathname.startsWith("/community"),
  },
  {
    id: "profile",
    label: "프로필",
    icon: <User size={20} />,
    path: "/profile",
    isActive: (pathname) => pathname.startsWith("/profile"),
  },
];

export function MobileBottomNavigation({
  onCreatePost,
  className,
}: MobileBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={cn("md:hidden", className)}>
      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-daangn-lg"
        role="navigation"
        aria-label="메인 내비게이션"
      >
        <div className="px-2 py-2">
          <div className="flex items-center justify-around">
            {/* Navigation Items */}
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 px-3 rounded-lg transition-daangn touch-target",
                    "active:scale-95 active:bg-gray-100",
                    isActive
                      ? "text-carrot-600 bg-carrot-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}>
                    {item.icon}
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-daangn",
                    isActive ? "text-carrot-600" : "text-gray-500"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Indicator */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-carrot-500 to-transparent opacity-70" />
      </nav>

      {/* Floating Action Button for Post Creation */}
      {onCreatePost && pathname.startsWith("/community") && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={onCreatePost}
            className={cn(
              "w-14 h-14 rounded-full bg-carrot-500 hover:bg-carrot-600 text-white shadow-daangn-xl hover:shadow-daangn-xl hover:scale-105",
              "transition-daangn active:scale-95",
              "border-4 border-white touch-target"
            )}
            aria-label="글 작성하기"
          >
            <Plus size={24} strokeWidth={2.5} />
            <span className="sr-only">새 글 작성</span>
          </Button>
          
          {/* Floating Button Background Glow */}
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-carrot-400 opacity-20 animate-pulse -z-10" />
        </div>
      )}

      {/* Safe Area Spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
}