"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COMMUNITY_CATEGORIES } from "@/lib/validation/community";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

// Korean translations for categories
const CATEGORY_TRANSLATIONS = {
  QNA: "질문답변",
  RECOMMEND: "추천정보",
  SECONDHAND: "중고거래",
  FREE: "자유게시판",
} as const;

interface CategorySidebarProps {
  postCounts?: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export function CategorySidebar({ postCounts }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getCategoryDisplayName = (category: string) => {
    return (
      CATEGORY_TRANSLATIONS[category as keyof typeof CATEGORY_TRANSLATIONS] ||
      category
    );
  };

  const getCategoryCount = (category?: string) => {
    if (!postCounts) return null;
    if (!category) return postCounts.total;
    return postCounts.byCategory[category] || 0;
  };

  return (
    <aside
      className="w-full md:w-64 md:flex-shrink-0"
      role="navigation"
      aria-label="카테고리 내비게이션"
    >
      <div className="px-4 md:px-0">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">카테고리</h2>
        </div>

        {/* Mobile Header with Collapse Toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">카테고리</h2>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label={isCollapsed ? "카테고리 펼치기" : "카테고리 접기"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Mobile: Horizontal scroll (when not collapsed) */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100 pb-4"
          )}
        >
          <div
            className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
            tabIndex={0}
            aria-label="카테고리 목록"
          >
            <button
              onClick={() => handleCategoryClick("")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                !currentCategory
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={!currentCategory ? "page" : undefined}
            >
              <span>전체</span>
              {postCounts && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    !currentCategory
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {postCounts.total}
                </span>
              )}
            </button>
            {COMMUNITY_CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    currentCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={currentCategory === cat ? "page" : undefined}
                >
                  <span>{getCategoryDisplayName(cat)}</span>
                  {count !== null && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        currentCategory === cat
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Vertical list */}
        <nav className="hidden md:block" aria-label="카테고리 목록">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleCategoryClick("")}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  !currentCategory
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent/60 hover:text-accent-foreground"
                )}
                aria-current={!currentCategory ? "page" : undefined}
              >
                <span>전체 게시글</span>
                {postCounts && (
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                      !currentCategory
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-accent-foreground/10 group-hover:text-accent-foreground"
                    )}
                  >
                    {postCounts.total}
                  </span>
                )}
              </button>
            </li>
            {COMMUNITY_CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat);
              const isActive = currentCategory === cat;
              return (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60 hover:text-accent-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{getCategoryDisplayName(cat)}</span>
                    {count !== null && (
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-accent-foreground/10 group-hover:text-accent-foreground"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
