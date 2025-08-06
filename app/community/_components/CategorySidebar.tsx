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
        {/* Desktop Header - Daangn style */}
        <div className="hidden lg:block mb-6">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
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
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-daangn group focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot-400 touch-target",
                  !currentCategory
                    ? "bg-carrot-50 text-carrot-700 border border-carrot-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-current={!currentCategory ? "page" : undefined}
              >
                <span>전체</span>
                {postCounts && (
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium transition-daangn min-w-[20px] text-center",
                      !currentCategory
                        ? "bg-carrot-100 text-carrot-700"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
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
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-daangn group focus:outline-none focus-visible:ring-2 focus-visible:ring-carrot-400 touch-target",
                      isActive
                        ? "bg-carrot-50 text-carrot-700 border border-carrot-100"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{getCategoryDisplayName(cat)}</span>
                    {count !== null && (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium transition-daangn min-w-[20px] text-center",
                          isActive
                            ? "bg-carrot-100 text-carrot-700"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
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
