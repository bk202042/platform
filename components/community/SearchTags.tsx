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
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-normal transition-colors duration-200",
                "border hover:bg-gray-50",
                isActive
                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
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

// Popular search tags data based on live Daangn analysis
export const POPULAR_SEARCH_TAGS: SearchTag[] = [
  { id: "restaurant", label: "맛집" },
  { id: "cat", label: "고양이" },
  { id: "dog", label: "강아지" },
  { id: "house", label: "집" },
  { id: "weather", label: "날씨" },
  { id: "bike", label: "자전거" },
  { id: "baseball", label: "야구" },
  { id: "hospital", label: "병원" },
  { id: "beauty", label: "미용" },
  { id: "cafe", label: "카페" },
  { id: "exercise", label: "운동" },
  { id: "study", label: "공부" },
];

// Utility function to get search tags based on location or category
export function getPopularTagsForLocation(_location?: string): SearchTag[] {
  // In a real app, this would fetch from API based on location
  // For now, return the default popular tags
  return POPULAR_SEARCH_TAGS.slice(0, 8); // Show top 8 tags
}