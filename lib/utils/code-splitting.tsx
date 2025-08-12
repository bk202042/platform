"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { Suspense, lazy, ComponentType } from "react";
import { ErrorBoundary } from "@/components/community/ErrorBoundary";

// Simplified lazy loading with error boundaries and loading states
export function createLazyComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode,
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
) {
  const LazyComponent = lazy(importFn);

  // Create a default error fallback component if none provided
  const DefaultErrorFallback = ({
    retry,
  }: {
    error: Error;
    retry: () => void;
  }) => (
    <div className="p-4 text-center text-red-500">
      <div>Error loading component</div>
      <button
        type="button"
        onClick={retry}
        className="mt-2 text-blue-500 underline"
      >
        다시 시도
      </button>
    </div>
  );

  return function LazyWrapper(props: any) {
    return (
      <ErrorBoundary fallback={errorFallback || DefaultErrorFallback}>
        <Suspense
          fallback={
            fallback || (
              <div className="animate-pulse bg-gray-200 h-32 rounded" />
            )
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Preload component for better UX
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  // Preload the component module
  importFn().catch((error) => {
    console.warn("Failed to preload component:", error);
  });
}

// Route-based code splitting
export const LazyComponents = {
  // Community components
  NewPostDialog: createLazyComponent(
    () =>
      import("@/app/community/_components/NewPostDialog").then((mod) => ({
        default: mod.NewPostDialog,
      })),
    <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ({ retry }) => (
      <div className="p-4 text-center text-red-500">
        <div>게시글 작성 폼을 불러올 수 없습니다.</div>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-blue-500 underline"
        >
          다시 시도
        </button>
      </div>
    )
  ),

  ImageGallery: createLazyComponent(
    () =>
      import("@/components/community/ImageGallery").then((mod) => ({
        default: mod.ImageGallery,
      })),
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />,
    ({ retry }) => (
      <div className="p-4 text-center text-red-500">
        <div>이미지 갤러리를 불러올 수 없습니다.</div>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-blue-500 underline"
        >
          다시 시도
        </button>
      </div>
    )
  ),

  CommentSection: createLazyComponent(
    () =>
      import("@/components/community/CommentSection").then((mod) => ({
        default: mod.CommentSection,
      })),
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-200 h-16 rounded" />
      ))}
    </div>,
    ({ retry }) => (
      <div className="p-4 text-center text-red-500">
        <div>댓글을 불러올 수 없습니다.</div>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-blue-500 underline"
        >
          다시 시도
        </button>
      </div>
    )
  ),

  // Property components (for future use)
  PropertyMap: createLazyComponent(
    () =>
      Promise.resolve({
        default: () => <div>Map not available</div>,
      }),
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
    ({ retry }) => (
      <div className="p-4 text-center text-red-500">
        <div>지도를 불러올 수 없습니다.</div>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-blue-500 underline"
        >
          다시 시도
        </button>
      </div>
    )
  ),
};

// Intersection observer based lazy loading
export function LazyOnVisible({
  children,
  fallback,
  rootMargin = "50px",
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Guard against SSR and ensure DOM is ready
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    const currentRef = ref.current;
    // Enhanced type checking for Node
    if (currentRef && currentRef instanceof Node) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback || <div className="h-32" />}
    </div>
  );
}

// Preload critical components on app start
export function preloadCriticalComponents() {
  if (typeof window === "undefined") return;

  // Preload components that are likely to be used soon
  setTimeout(() => {
    preloadComponent(() =>
      import("@/app/community/_components/NewPostDialog").then((mod) => ({
        default: mod.NewPostDialog,
      }))
    );
  }, 2000); // Preload after 2 seconds to not interfere with initial load
}

// Component for managing dynamic imports with loading states
export function DynamicImport({
  importFn,
  loading: LoadingComponent,
  error: ErrorComponent,
  ...props
}: {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  loading?: ComponentType;
  error?: ComponentType<{ error: Error; retry: () => void }>;
  [key: string]: any;
}) {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const moduleResult = await importFn();
      setComponent(() => moduleResult.default);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load component")
      );
    } finally {
      setIsLoading(false);
    }
  }, [importFn]);

  React.useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (error) {
    return ErrorComponent ? (
      <ErrorComponent error={error} retry={loadComponent} />
    ) : (
      <div className="p-4 text-center text-red-500">
        컴포넌트를 불러올 수 없습니다.
        <button
          type="button"
          onClick={loadComponent}
          className="ml-2 text-blue-500 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (isLoading) {
    return LoadingComponent ? (
      <LoadingComponent />
    ) : (
      <div className="animate-pulse bg-gray-200 h-32 rounded" />
    );
  }

  if (!Component) {
    return <div>컴포넌트를 찾을 수 없습니다.</div>;
  }

  return <Component {...props} />;
}

// Initialize preloading
if (typeof window !== "undefined") {
  preloadCriticalComponents();
}
