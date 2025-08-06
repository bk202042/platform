"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COMMUNITY_CATEGORIES } from "@/lib/validation/community";
import { cn } from "@/lib/utils";

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

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
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
      className="w-full lg:w-64 lg:flex-shrink-0"
      role="navigation"
      aria-label="카테고리 내비게이션"
    >
      <div className="p-6">
        {/* Desktop Header - Ultra-minimal Daangn style */}
        <div className="hidden lg:block mb-4">
          <h2 className="text-sm font-medium text-gray-600 border-b border-gray-50 pb-2">
            카테고리
          </h2>
        </div>

        {/* Desktop: Vertical list - Daangn style */}
        <nav className="hidden lg:block" aria-label="카테고리 목록">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => handleCategoryClick("")}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm font-normal transition-all duration-200 group focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-400",
                  !currentCategory
                    ? "bg-orange-25 text-orange-600"
                    : "text-gray-600 hover:bg-gray-25"
                )}
                aria-current={!currentCategory ? "page" : undefined}
              >
                <span>전체</span>
                {postCounts && (
                  <span
                    className={cn(
                      "text-xs px-1 py-0.5 rounded-sm font-normal transition-colors min-w-[16px] text-center",
                      !currentCategory
                        ? "bg-orange-50 text-orange-600"
                        : "bg-gray-50 text-gray-500 group-hover:bg-gray-100"
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
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm font-normal transition-all duration-200 group focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-400",
                      isActive
                        ? "bg-orange-25 text-orange-600"
                        : "text-gray-600 hover:bg-gray-25"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{getCategoryDisplayName(cat)}</span>
                    {count !== null && (
                      <span
                        className={cn(
                          "text-xs px-1 py-0.5 rounded-sm font-normal transition-colors min-w-[16px] text-center",
                          isActive
                            ? "bg-orange-50 text-orange-600"
                            : "bg-gray-50 text-gray-500 group-hover:bg-gray-100"
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

        {/* Mobile: Hidden - categories shown in modal */}
        <div className="lg:hidden">
          {/* Mobile categories are handled by the mobile category button in the main layout */}
        </div>
      </div>
    </aside>
  );
}
