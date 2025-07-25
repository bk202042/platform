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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-lg"
        role="navigation"
        aria-label="메인 내비게이션"
      >
        <div className="px-2 py-1">
          <div className="flex items-center justify-around">
            {/* Navigation Items */}
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-h-[52px] min-w-[52px]",
                    "active:scale-95 active:bg-zinc-100",
                    isActive
                      ? "text-orange-600 bg-orange-50"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
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
                    "text-xs font-medium mt-1 transition-colors duration-200",
                    isActive ? "text-orange-600" : "text-zinc-500"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Indicator */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60" />
      </nav>

      {/* Floating Action Button for Post Creation */}
      {onCreatePost && pathname.startsWith("/community") && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={onCreatePost}
            className={cn(
              "w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl",
              "transition-all duration-300 ease-out active:scale-95",
              "border-4 border-white"
            )}
            aria-label="글 작성하기"
          >
            <Plus size={24} />
            <span className="sr-only">새 글 작성</span>
          </Button>
          
          {/* Floating Button Background Glow */}
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-orange-400 opacity-20 animate-pulse -z-10" />
        </div>
      )}

      {/* Safe Area Spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
}