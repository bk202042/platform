"use client";

// React optimization utilities and patterns

import React, {
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  ComponentType,
  ReactNode,
} from "react";

// Memoization utilities
export const memoization = {
  // Deep comparison memo for complex props
  deepMemo: <P extends Record<string, unknown>>(
    Component: ComponentType<P>
  ) => {
    return memo(Component, (prevProps, nextProps) => {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    });
  },

  // Shallow comparison memo (default React.memo behavior)
  shallowMemo: <P extends Record<string, unknown>>(
    Component: ComponentType<P>
  ) => {
    return memo(Component);
  },

  // Custom comparison memo
  customMemo: <P extends Record<string, unknown>>(
    Component: ComponentType<P>,
    areEqual: (prevProps: P, nextProps: P) => boolean
  ) => {
    return memo(Component, areEqual);
  },
};

// Optimized list rendering
export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  const memoizedItems = useMemo(() => items, [items]);

  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  if (memoizedItems.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className={className}>
      {memoizedItems.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}

// Virtual scrolling for large lists
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div className="relative" style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, visibleRange.start + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Optimized event handlers
export const eventOptimization = {
  // Debounced event handler
  useDebounced: <T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    return useCallback(
      (...args: T) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    );
  },

  // Throttled event handler
  useThrottled: <T extends unknown[]>(
    callback: (...args: T) => void,
    limit: number
  ) => {
    const inThrottle = useRef<boolean>(false);

    return useCallback(
      (...args: T) => {
        if (!inThrottle.current) {
          callback(...args);
          inThrottle.current = true;
          setTimeout(() => {
            inThrottle.current = false;
          }, limit);
        }
      },
      [callback, limit]
    );
  },
};

// Render optimization hooks
export const renderOptimization = {
  // Prevent unnecessary re-renders
  useStableValue: <T,>(value: T): T => {
    const ref = useRef<T>(value);

    if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
      ref.current = value;
    }

    return ref.current;
  },

  // Memoize expensive calculations
  useExpensiveCalculation: <T,>(
    calculation: () => T,
    dependencies: React.DependencyList
  ): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => calculation(), [calculation, ...dependencies]);
  },

  // Stable callback reference
  useStableCallback: <T extends (...args: unknown[]) => unknown>(
    callback: T
  ): T => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }, []) as T;
  },
};

// Component performance monitoring
export function withPerformanceTracking<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  componentName: string
) {
  return memo(function PerformanceTrackedComponent(props: P) {
    const renderStartTime = useRef<number | undefined>(undefined);
    const [renderTime, setRenderTime] = useState<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now();
    });

    useEffect(() => {
      if (renderStartTime.current) {
        const duration = performance.now() - renderStartTime.current;
        setRenderTime(duration);

        if (process.env.NODE_ENV === "development") {
          console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      }
    }, []);

    return (
      <>
        <Component {...props} />
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-0 right-0 bg-black/80 text-white px-2 py-1 text-xs z-[9999]">
            {componentName}: {renderTime.toFixed(2)}ms
          </div>
        )}
      </>
    );
  });
}

// Lazy component with error boundary
export function LazyComponent<P extends Record<string, unknown>>({
  importFn,
  fallback,
  errorFallback,
  ...props
}: {
  importFn: () => Promise<{ default: ComponentType<P> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
} & P) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err : new Error("Failed to load component")
        );
        setLoading(false);
      });
  }, [importFn]);

  if (loading) {
    return <>{fallback || <div>Loading...</div>}</>;
  }

  if (error) {
    return <>{errorFallback || <div>Error loading component</div>}</>;
  }

  if (!Component) {
    return <div>Component not found</div>;
  }

  return <Component {...(props as unknown as P)} />;
}

// Bundle size optimization utilities
export const bundleOptimization = {
  // Dynamic import with retry
  dynamicImport: async <T,>(
    importFn: () => Promise<T>,
    retries = 3
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("Max retries exceeded");
  },

  // Preload critical components
  preloadComponents: (importFns: Array<() => Promise<unknown>>) => {
    if (typeof window !== "undefined") {
      // Preload after initial render
      setTimeout(() => {
        importFns.forEach((importFn) => {
          importFn().catch((error) => {
            console.warn("Failed to preload component:", error);
          });
        });
      }, 100);
    }
  },
};

// Memory leak prevention
export const memoryOptimization = {
  // Cleanup effect hook
  useCleanupEffect: (
    effect: () => (() => void) | void,
    deps: React.DependencyList = []
  ) => {
    useEffect(() => {
      const cleanup = effect();
      return cleanup;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effect, ...deps]);
  },

  // Ref cleanup
  useCleanupRef: <T,>() => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
      return () => {
        ref.current = null;
      };
    }, []);

    return ref;
  },

  // Event listener cleanup
  useEventListener: (
    target: EventTarget | null,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    useEffect(() => {
      if (!target) return;

      target.addEventListener(event, handler, options);

      return () => {
        target.removeEventListener(event, handler, options);
      };
    }, [target, event, handler, options]);
  },
};

// Performance monitoring hook
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    lastRenderTime.current = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  };
}
