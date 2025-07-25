"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityCategory } from "@/lib/validation/community";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  preserveFilters?: boolean;
}

interface CommunityBreadcrumbProps {
  items?: BreadcrumbItem[];
  postTitle?: string;
  category?: CommunityCategory;
  apartmentName?: string;
  cityName?: string;
  showMobileBack?: boolean;
  className?: string;
}

// Category labels in Korean
const CATEGORY_LABELS = {
  QNA: "Q&A",
  RECOMMEND: "추천",
  SECONDHAND: "중고거래",
  FREE: "나눔",
} as const;

export function CommunityBreadcrumb({
  items,
  postTitle,
  category,
  apartmentName,
  cityName,
  showMobileBack = false,
  className,
}: CommunityBreadcrumbProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Build dynamic breadcrumb items based on current filters and context
  const buildBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items;

    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "커뮤니티", href: "/community", preserveFilters: true },
    ];

    // Add location context if available
    if (cityName && apartmentName) {
      breadcrumbItems.push({
        label: `${cityName} · ${apartmentName}`,
        href: `/community?${buildFilterUrl({ apartmentId: searchParams.get("apartmentId") })}`,
        preserveFilters: true,
      });
    }

    // Add category if provided
    if (category) {
      const categoryUrl = buildFilterUrl({
        category: category.toLowerCase(),
        apartmentId: searchParams.get("apartmentId"),
        sort: searchParams.get("sort"),
      });

      breadcrumbItems.push({
        label: CATEGORY_LABELS[category],
        href: `/community?${categoryUrl}`,
        preserveFilters: true,
      });
    }

    // Add post title if provided (current page, no link)
    if (postTitle) {
      breadcrumbItems.push({
        label:
          postTitle.length > 40 ? `${postTitle.slice(0, 40)}...` : postTitle,
      });
    }

    return breadcrumbItems;
  };

  // Helper function to build filter URL while preserving state
  const buildFilterUrl = (filters: Record<string, string | null>) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    return params.toString();
  };

  // Handle back navigation with filter preservation
  const handleBackNavigation = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to community page with current filters
      const currentFilters = {
        category: searchParams.get("category"),
        apartmentId: searchParams.get("apartmentId"),
        sort: searchParams.get("sort"),
      };

      const filterUrl = buildFilterUrl(currentFilters);
      router.push(`/community${filterUrl ? `?${filterUrl}` : ""}`);
    }
  };

  const breadcrumbItems = buildBreadcrumbItems();

  return (
    <div className={cn("mb-4", className)}>
      {/* Mobile back button */}
      {showMobileBack && (
        <div className="md:hidden mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackNavigation}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 p-2 -ml-2"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">뒤로</span>
          </Button>
        </div>
      )}

      {/* Daangn-style breadcrumb navigation */}
      <nav
        aria-label="페이지 경로"
        className="block"
        role="navigation"
      >
        <ol className="flex items-center gap-1 text-sm text-zinc-500 flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index === 0 && (
                <Home
                  size={14}
                  className="text-zinc-400 flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-orange-600 transition-colors duration-200 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 rounded px-1 py-0.5 text-zinc-600"
                  aria-label={`${item.label}로 이동`}  
                  aria-current={
                    index === breadcrumbItems.length - 1 ? "page" : undefined
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-700 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}

              {index < breadcrumbItems.length - 1 && (
                <ChevronRight
                  size={14}
                  className="text-zinc-400 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
