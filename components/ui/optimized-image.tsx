"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  useIntersectionObserver,
  useProgressiveImage,
} from "@/lib/utils/performance";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  sizes,
  fill = false,
  objectFit = "cover",
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageRef = React.useRef<HTMLDivElement>(null);

  // Use intersection observer for lazy loading optimization
  const { hasIntersected } = useIntersectionObserver(
    imageRef as React.RefObject<Element>,
    {
      rootMargin: "50px",
      threshold: 0.1,
    }
  );

  // Progressive image loading for better UX
  const { src: progressiveSrc } = useProgressiveImage(
    hasIntersected || priority ? src : "",
    blurDataURL
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? "100vw"
      : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw");

  // Error fallback
  if (hasError) {
    return (
      <div
        ref={imageRef}
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Loading placeholder
  if (!hasIntersected && !priority) {
    return (
      <div
        ref={imageRef}
        className={cn(
          "bg-gray-200 animate-pulse",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      />
    );
  }

  return (
    <div ref={imageRef} className={fill ? "relative" : ""}>
      {/* Loading overlay */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse z-10",
            fill ? "" : "rounded"
          )}
        />
      )}

      <Image
        src={progressiveSrc || src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={responsiveSizes}
        loading={loading}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? `object-${objectFit}` : "",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={
          fill
            ? undefined
            : {
                width: width || "auto",
                height: height || "auto",
                objectFit,
              }
        }
      />
    </div>
  );
}

// Specialized components for common use cases
export function PostImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={cn("rounded-lg", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      quality={80}
    />
  );
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      quality={90}
      priority={size <= 50} // Prioritize small avatars
    />
  );
}

export function HeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority
      quality={85}
      sizes="100vw"
    />
  );
}
