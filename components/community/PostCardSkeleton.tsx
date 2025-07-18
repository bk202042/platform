import * as React from "react";

interface PostCardSkeletonProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Whether to show category badge skeleton */
  showCategory?: boolean;
  /** Whether to show apartment info skeleton */
  showApartment?: boolean;
  /** Whether to show title skeleton */
  showTitle?: boolean;
  /** Whether to show image indicator skeleton */
  showImages?: boolean;
}

export function PostCardSkeleton({
  count = 1,
  showCategory = true,
  showApartment = true,
  showTitle = true,
  showImages = false,
}: PostCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeletonItem
          key={index}
          showCategory={showCategory}
          showApartment={showApartment}
          showTitle={showTitle}
          showImages={showImages}
        />
      ))}
    </>
  );
}

function PostCardSkeletonItem({
  showCategory,
  showApartment,
  showTitle,
  showImages,
}: Omit<PostCardSkeletonProps, "count">) {
  return (
    <article
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
      aria-label="게시글 로딩 중"
    >
      <div className="p-4 sm:p-5">
        {/* Header with category badge and apartment info skeletons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {showCategory && (
              <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
            )}
            {showApartment && (
              <div className="h-6 w-20 bg-gray-100 rounded-md animate-pulse" />
            )}
          </div>
        </div>

        {/* Content skeletons */}
        <div className="space-y-3">
          {showTitle && (
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          )}

          {/* Body text skeleton - 3 lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>

          {/* Image indicator skeleton */}
          {showImages && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded border animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
        </div>

        {/* Footer with author, date, and engagement metrics skeletons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Author skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Date skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Engagement metrics skeletons */}
          <div className="flex items-center gap-4">
            {/* Likes skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Comments skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Export individual skeleton item for more granular control
export { PostCardSkeletonItem };

// Preset configurations for common use cases
export const PostCardSkeletonPresets = {
  /** Standard skeleton with all elements */
  standard: (count = 3) => (
    <PostCardSkeleton
      count={count}
      showCategory={true}
      showApartment={true}
      showTitle={true}
      showImages={false}
    />
  ),

  /** Minimal skeleton without optional elements */
  minimal: (count = 3) => (
    <PostCardSkeleton
      count={count}
      showCategory={false}
      showApartment={false}
      showTitle={false}
      showImages={false}
    />
  ),

  /** Rich skeleton with all elements including images */
  rich: (count = 3) => (
    <PostCardSkeleton
      count={count}
      showCategory={true}
      showApartment={true}
      showTitle={true}
      showImages={true}
    />
  ),
} as const;
