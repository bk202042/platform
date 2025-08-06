"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface SearchTag {
  id: string;
  label: string;
  count?: number;
}

interface SearchTagsProps {
  /** Popular search tags to display */
  tags: SearchTag[];
  /** Callback when a tag is clicked */
  onTagClick: (tag: SearchTag) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show tag as active */
  activeTagId?: string;
}

export const SearchTags = memo(function SearchTags({
  tags,
  onTagClick,
  className,
  activeTagId
}: SearchTagsProps) {
  // Don't render if no tags
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-4", className)}>
      <h3 className="text-xs font-medium text-gray-500 mb-2 px-1">인기 검색어</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isActive = activeTagId === tag.id;
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagClick(tag)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-normal transition-colors duration-200 touch-manipulation",
                "border hover:bg-gray-50 active:scale-95",
                "min-h-[36px] min-w-[44px]", // Enhanced touch target
                isActive
                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 active:bg-orange-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 active:bg-gray-100"
              )}
            >
              <span>{tag.label}</span>
              {tag.count && (
                <span className={cn(
                  "text-xs font-normal",
                  isActive ? "text-orange-600" : "text-gray-500"
                )}>
                  {tag.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Popular search tags data optimized for Korean expats in Vietnam
export const POPULAR_SEARCH_TAGS: SearchTag[] = [
  { id: "hcm-restaurant", label: "호치민 맛집" },
  { id: "hanoi-realestate", label: "하노이 부동산" },
  { id: "danang-travel", label: "다낭 여행" },
  { id: "vietnam-living", label: "베트남 생활" },
  { id: "korean-mart", label: "한국마트" },
  { id: "vietnam-hospital", label: "베트남 병원" },
  { id: "korean-food", label: "한식당" },
  { id: "visa-info", label: "비자 정보" },
  { id: "apartment-rental", label: "아파트 렌탈" },
  { id: "korean-community", label: "한인 커뮤니티" },
  { id: "vietnam-beauty", label: "베트남 미용" },
  { id: "motorbike", label: "오토바이" },
  { id: "vietnamese-class", label: "베트남어 수업" },
  { id: "job-search", label: "구인구직" },
  { id: "currency-exchange", label: "환전" },
];

// Location-specific search tags for Vietnamese cities
export const VIETNAM_LOCATION_TAGS: Record<string, SearchTag[]> = {
  "ho-chi-minh": [
    { id: "hcm-district1", label: "1구 맛집" },
    { id: "hcm-district3", label: "3구 아파트" },
    { id: "hcm-district7", label: "7구 한인타운" },
    { id: "hcm-korean-school", label: "호치민 한국학교" },
  ],
  "hanoi": [
    { id: "hanoi-oldquarter", label: "하노이 구시가지" },
    { id: "hanoi-westlake", label: "웨스트레이크" },
    { id: "hanoi-korean-embassy", label: "한국 대사관" },
    { id: "hanoi-hospital", label: "하노이 병원" },
  ],
  "danang": [
    { id: "danang-beach", label: "다낭 해변" },
    { id: "danang-airport", label: "다낭 공항" },
    { id: "danang-korean-restaurant", label: "다낭 한식당" },
    { id: "danang-resort", label: "다낭 리조트" },
  ],
};

// Utility function to get search tags based on location or category
export function getPopularTagsForLocation(_location?: string): SearchTag[] {
  // If location is specified, combine location-specific and general tags
  if (_location && VIETNAM_LOCATION_TAGS[_location.toLowerCase()]) {
    const locationTags = VIETNAM_LOCATION_TAGS[_location.toLowerCase()];
    const generalTags = POPULAR_SEARCH_TAGS.slice(0, 4);
    return [...locationTags, ...generalTags].slice(0, 8);
  }
  
  // Return top 8 popular tags for Korean expats in Vietnam
  return POPULAR_SEARCH_TAGS.slice(0, 8);
}