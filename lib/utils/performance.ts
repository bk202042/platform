// Performance optimization utilities

// Debounce function for search inputs and other frequent operations
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
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
  limit: number,
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
  options?: IntersectionObserverInit,
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
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

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality = 75,
): string {
  // This would integrate with your image optimization service
  // For now, return the original src with parameters for future use
  console.log(
    `Image optimization: ${src}, width: ${width}, quality: ${quality}`,
  );
  return src;
}

// Bundle size analysis helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === "development") {
    console.log("Bundle analysis would go here in development mode");
    // You could integrate with webpack-bundle-analyzer or similar tools
  }
}
