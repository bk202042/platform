"use client";

import { useState, useEffect, useCallback } from "react";

interface UseProgressiveImageOptions {
  placeholderQuality?: number;
  placeholderWidth?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface UseProgressiveImageReturn {
  src: string | undefined;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

export function useProgressiveImage(
  src: string,
  options: UseProgressiveImageOptions = {}
): UseProgressiveImageReturn {
  const {
    placeholderQuality = 10,
    placeholderWidth = 50,
    onLoad,
    onError,
  } = options;

  const [currentSrc, setCurrentSrc] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const generatePlaceholderUrl = useCallback(
    (originalSrc: string) => {
      // If it's a Supabase storage URL, add transformation parameters
      if (originalSrc.includes("/storage/v1/object/public/")) {
        const url = new URL(originalSrc);
        url.searchParams.set("width", placeholderWidth.toString());
        url.searchParams.set("quality", placeholderQuality.toString());
        return url.toString();
      }
      return originalSrc;
    },
    [placeholderQuality, placeholderWidth]
  );

  useEffect(() => {
    if (!src) {
      setCurrentSrc(undefined);
      setLoading(false);
      setError(null);
      setLoaded(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoaded(false);

    // Generate and set placeholder image first
    const placeholderSrc = generatePlaceholderUrl(src);
    setCurrentSrc(placeholderSrc);

    // Load full quality image
    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
      setLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      const errorMsg = "Failed to load image";
      setError(errorMsg);
      setLoading(false);
      onError?.(new Error(errorMsg));
    };

    img.src = src;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, generatePlaceholderUrl, onLoad, onError]);

  return {
    src: currentSrc,
    loading,
    error,
    loaded,
  };
}
