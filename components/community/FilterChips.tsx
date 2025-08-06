"use client";

import React, { memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Korean translations for categories
const CATEGORY_TRANSLATIONS = {
  QNA: "Q&A",
  RECOMMEND: "추천",
  SECONDHAND: "중고거래",
  FREE: "나눔",
} as const;

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'category' | 'location' | 'sort';
}

interface FilterChipsProps {
  /** Active filters to display */
  filters: FilterChip[];
  /** Callback when a filter is removed */
  onRemoveFilter: (filterId: string) => void;
  /** Callback when all filters are cleared */
  onClearAll: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const FilterChips = memo(function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className
}: FilterChipsProps) {
  // Don't render if no active filters
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap mb-3", className)}>
      {/* Active filter chips */}
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-xs font-normal transition-colors duration-200 hover:bg-gray-200"
        >
          <span>{filter.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.id)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-gray-300 transition-colors duration-150"
            aria-label={`${filter.label} 필터 제거`}
          >
            <X size={8} className="text-gray-500" />
          </button>
        </div>
      ))}

      {/* Clear all button - only show if more than 1 filter */}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-gray-600 font-normal transition-colors duration-200 px-1.5 py-0.5 rounded-md hover:bg-gray-50"
        >
          전체 해제
        </button>
      )}
    </div>
  );
});

// Utility function to create filter chips from URL search params
export function createFilterChipsFromParams(searchParams: URLSearchParams): FilterChip[] {
  const chips: FilterChip[] = [];

  // Category filter
  const category = searchParams.get('category');
  if (category) {
    chips.push({
      id: 'category',
      label: CATEGORY_TRANSLATIONS[category as keyof typeof CATEGORY_TRANSLATIONS] || category,
      value: category,
      type: 'category'
    });
  }

  // Location filter
  const location = searchParams.get('location');
  if (location) {
    chips.push({
      id: 'location',
      label: location,
      value: location,
      type: 'location'
    });
  }

  // Sort filter (only show if not default)
  const sort = searchParams.get('sort');
  if (sort && sort !== 'recent') {
    const sortLabels = {
      'popular': '인기순',
      'comments': '댓글순',
      'likes': '좋아요순'
    };
    
    chips.push({
      id: 'sort',
      label: sortLabels[sort as keyof typeof sortLabels] || sort,
      value: sort,
      type: 'sort'
    });
  }

  return chips;
}