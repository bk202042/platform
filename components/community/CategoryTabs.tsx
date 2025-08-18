"use client";

import { COMMUNITY_CATEGORIES } from "@/lib/validation/community";
import { CommunityCategory } from "@/lib/validation/community";

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  postCounts?: {
    total: number;
    byCategory: Record<string, number>;
  };
}

const CATEGORY_LABELS: Record<CommunityCategory | "전체", string> = {
  "전체": "전체",
  "QNA": "질문답변",
  "RECOMMEND": "추천정보",
  "SECONDHAND": "중고거래",
  "FREE": "자유게시판",
};

export function CategoryTabs({ 
  selectedCategory, 
  onCategoryChange, 
  postCounts 
}: CategoryTabsProps) {
  const allCategories = ["전체", ...COMMUNITY_CATEGORIES];
  
  return (
    <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
      {allCategories.map(category => {
        const count = category === "전체" 
          ? postCounts?.total 
          : postCounts?.byCategory[category];
        
        const isSelected = category === selectedCategory || 
          (category === "전체" && !selectedCategory);
        
        return (
          <button
            key={category}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ease-out min-h-[44px] touch-manipulation ${
              isSelected
                ? 'bg-[#007882] text-white shadow-[0_2px_8px_rgba(0,120,130,0.25)] hover:bg-[#006670] hover:shadow-[0_4px_12px_rgba(0,120,130,0.3)] hover:-translate-y-0.5' 
                : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
            }`}
            onClick={() => onCategoryChange(category === "전체" ? "" : category)}
          >
            <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
            {count && count > 0 && (
              <span className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                isSelected 
                  ? 'bg-white/20 text-white backdrop-blur-sm' 
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}