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
            className={`flex items-center gap-1 px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isSelected
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onCategoryChange(category === "전체" ? "" : category)}
          >
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            {count && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
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