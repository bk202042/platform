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
    <div className={cn(
      "mb-6 font-['Apple_SD_Gothic_Neo','Malgun_Gothic','-apple-system','BlinkMacSystemFont',sans-serif]", // 24px bottom margin (Daangn 8px scale) + Korean fonts
      className
    )}>
      <h3 className="text-xs font-medium text-zinc-500 mb-3 px-1">인기 검색어</h3> {/* 12px margin */}
      <div className="flex flex-wrap gap-2"> {/* 8px gap */}
        {tags.map((tag) => {
          const isActive = activeTagId === tag.id;
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagClick(tag)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ease-out touch-manipulation",
                "border hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] active:scale-95",
                "min-h-[44px] min-w-[44px]", // Daangn 44px touch targets
                isActive
                  ? "bg-carrot-50 text-carrot-700 border-carrot-200 hover:bg-carrot-100 hover:border-carrot-300 active:bg-carrot-200"
                  : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 active:bg-zinc-100"
              )}
            >
              <span className="leading-[1.25]">{tag.label}</span> {/* Daangn line-height */}
              {tag.count && (
                <span className={cn(
                  "text-xs font-normal leading-[1.25]",
                  isActive ? "text-carrot-600" : "text-zinc-500"
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
// Popular search tags optimized for Korean expats in Vietnam with warm neighborhood feeling
export const POPULAR_SEARCH_TAGS: SearchTag[] = [
  { id: "hcm-restaurant", label: "호치민 맛집", count: 142 },
  { id: "hanoi-realestate", label: "하노이 부동산", count: 89 },
  { id: "danang-travel", label: "다낭 여행", count: 67 },
  { id: "vietnam-living", label: "베트남 생활", count: 156 },
  { id: "korean-mart", label: "한국마트", count: 73 },
  { id: "vietnam-hospital", label: "베트남 병원", count: 45 },
  { id: "korean-food", label: "한식당", count: 98 },
  { id: "visa-info", label: "비자 정보", count: 34 },
  { id: "apartment-rental", label: "아파트 렌탈", count: 112 },
  { id: "korean-community", label: "한인 커뮤니티", count: 87 },
  { id: "vietnam-beauty", label: "베트남 미용", count: 56 },
  { id: "motorbike", label: "오토바이", count: 78 },
  { id: "vietnamese-class", label: "베트남어 수업", count: 41 },
  { id: "job-search", label: "구인구직", count: 63 },
  { id: "currency-exchange", label: "환전", count: 29 },
];

// Location-specific search tags with community counts reflecting warm neighborhood activity
export const VIETNAM_LOCATION_TAGS: Record<string, SearchTag[]> = {
  "ho-chi-minh": [
    { id: "hcm-district1", label: "1구 맛집", count: 47 },
    { id: "hcm-district3", label: "3구 아파트", count: 32 },
    { id: "hcm-district7", label: "7구 한인타운", count: 68 },
    { id: "hcm-korean-school", label: "호치민 한국학교", count: 23 },
  ],
  "hanoi": [
    { id: "hanoi-oldquarter", label: "하노이 구시가지", count: 38 },
    { id: "hanoi-westlake", label: "웨스트레이크", count: 45 },
    { id: "hanoi-korean-embassy", label: "한국 대사관", count: 19 },
    { id: "hanoi-hospital", label: "하노이 병원", count: 26 },
  ],
  "danang": [
    { id: "danang-beach", label: "다낭 해변", count: 34 },
    { id: "danang-airport", label: "다낭 공항", count: 18 },
    { id: "danang-korean-restaurant", label: "다낭 한식당", count: 29 },
    { id: "danang-resort", label: "다낭 리조트", count: 22 },
  ],
};

// Utility function to get search tags that reflect warm neighborhood connections
export function getPopularTagsForLocation(_location?: string): SearchTag[] {
  // If location is specified, combine location-specific and general tags for neighborhood feel
  if (_location && VIETNAM_LOCATION_TAGS[_location.toLowerCase()]) {
    const locationTags = VIETNAM_LOCATION_TAGS[_location.toLowerCase()];
    const generalTags = POPULAR_SEARCH_TAGS.slice(0, 4);
    return [...locationTags, ...generalTags].slice(0, 8);
  }
  
  // Return top 8 popular tags that help Korean expats connect in Vietnamese neighborhoods
  return POPULAR_SEARCH_TAGS.slice(0, 8);
}