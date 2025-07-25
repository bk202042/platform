// Performance optimization utilities

import { useCallback, useEffect, useRef, useState } from "react";

// Debounce function for search inputs and other frequent operations
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events and other high-frequency operations
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Intersection Observer hook for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
}

// React hook for intersection observer
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = createIntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Preload critical resources
export function preloadResource(
  href: string,
  as: string,
  crossorigin?: string
) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  }
}

// Prefetch resources for future navigation
export function prefetchResource(href: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
}

// Measure performance
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== "undefined" && "performance" in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTimeRef = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      startTimeRef.current = performance.now();
    }
  }, []);

  const end = useCallback(() => {
    if (
      startTimeRef.current !== undefined &&
      typeof window !== "undefined" &&
      "performance" in window
    ) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      startTimeRef.current = undefined;
    }
  }, [name]);

  return { start, end };
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// React hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality = 75
): string {
  // This would integrate with your image optimization service
  // For now, return the original src with parameters for future use
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Image optimization: ${src}, width: ${width}, quality: ${quality}`
    );
  }
  return src;
}

// Bundle size analysis helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === "development") {
    console.log("Bundle analysis would go here in development mode");
    // You could integrate with webpack-bundle-analyzer or similar tools
  }
}

// Memory usage monitoring
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

export function getMemoryUsage() {
  if (
    typeof window !== "undefined" &&
    "performance" in window &&
    "memory" in performance
  ) {
    const memory = (performance as PerformanceWithMemory).memory;
    if (memory) {
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }
  }
  return null;
}

// React hook for memory monitoring
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] =
    useState<ReturnType<typeof getMemoryUsage>>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      setMemoryUsage(getMemoryUsage());
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Efficient re-rendering prevention
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Virtual scrolling utilities
export function calculateVisibleItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan = 5
) {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    Number.MAX_SAFE_INTEGER
  );

  return {
    start: Math.max(0, visibleStart - overscan),
    end: visibleEnd + overscan,
  };
}

// Image lazy loading with progressive enhancement
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  return { src: currentSrc, loading, error };
}

// Connection quality detection
interface NetworkInformation {
  effectiveType: string;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export function useConnectionQuality() {
  const [connectionQuality, setConnectionQuality] = useState<
    "slow" | "fast" | "unknown"
  >("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const updateConnectionQuality = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === "slow-2g" || effectiveType === "2g") {
          setConnectionQuality("slow");
        } else {
          setConnectionQuality("fast");
        }
      };

      updateConnectionQuality();
      connection.addEventListener("change", updateConnectionQuality);

      return () =>
        connection.removeEventListener("change", updateConnectionQuality);
    }
  }, []);

  return connectionQuality;
}
