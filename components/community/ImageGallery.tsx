"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useProgressiveImage } from "@/lib/hooks/useProgressiveImage";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImageGalleryImage {
  id: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryProps {
  images: ImageGalleryImage[];
  layout?: "grid" | "carousel" | "masonry";
  onImageClick?: (index: number) => void;
  lazy?: boolean;
  className?: string;
  showLightbox?: boolean;
  maxHeight?: number;
}

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  lazy?: boolean;
  width?: number;
  height?: number;
}

// Progressive Image Component with blur-up effect
function ProgressiveImage({
  src,
  alt,
  className,
  onClick,
  lazy = true,
  width,
  height,
}: ProgressiveImageProps) {
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  const {
    src: progressiveSrc,
    loading,
    loaded,
  } = useProgressiveImage(isInView ? src : "", {
    placeholderQuality: 10,
    placeholderWidth: 50,
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-gray-100 transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {progressiveSrc && (
        <Image
          src={progressiveSrc}
          alt={alt}
          fill={!width || !height}
          width={width}
          height={height}
          className={cn(
            "object-cover transition-all duration-500",
            loading && !loaded && "blur-sm scale-105",
            loaded && "blur-0 scale-100"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}

      {/* Loading placeholder */}
      {!progressiveSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
        <ZoomIn className="text-white w-6 h-6" />
      </div>
    </div>
  );
}

// Lightbox Modal Component
interface LightboxProps {
  images: ImageGalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: LightboxProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentImage.src}
            alt={currentImage.alt || `이미지 ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// Main ImageGallery Component
export function ImageGallery({
  images,
  layout = "grid",
  onImageClick,
  lazy = true,
  className,
  showLightbox = true,
  maxHeight = 400,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback(
    (index: number) => {
      setCurrentImageIndex(index);
      if (showLightbox) {
        setLightboxOpen(true);
      }
      onImageClick?.(index);
    },
    [onImageClick, showLightbox]
  );

  const handleLightboxNext = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  }, [images.length]);

  const handleLightboxPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleCarouselScroll = useCallback((direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    const newScrollLeft =
      carouselRef.current.scrollLeft +
      (direction === "right" ? scrollAmount : -scrollAmount);

    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  if (images.length === 0) {
    return null;
  }

  // Grid Layout
  if (layout === "grid") {
    return (
      <>
        <div className={cn("grid gap-2", className)}>
          {images.length === 1 && (
            <div className="aspect-video rounded-lg overflow-hidden cursor-pointer">
              <ProgressiveImage
                src={images[0].src}
                alt={images[0].alt || "이미지"}
                className="w-full h-full"
                onClick={() => handleImageClick(0)}
                lazy={lazy}
              />
            </div>
          )}

          {images.length === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                >
                  <ProgressiveImage
                    src={image.src}
                    alt={image.alt || `이미지 ${index + 1}`}
                    className="w-full h-full"
                    onClick={() => handleImageClick(index)}
                    lazy={lazy}
                  />
                </div>
              ))}
            </div>
          )}

          {images.length === 3 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="row-span-2 aspect-square rounded-lg overflow-hidden cursor-pointer">
                <ProgressiveImage
                  src={images[0].src}
                  alt={images[0].alt || "이미지 1"}
                  className="w-full h-full"
                  onClick={() => handleImageClick(0)}
                  lazy={lazy}
                />
              </div>
              {images.slice(1).map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                >
                  <ProgressiveImage
                    src={image.src}
                    alt={image.alt || `이미지 ${index + 2}`}
                    className="w-full h-full"
                    onClick={() => handleImageClick(index + 1)}
                    lazy={lazy}
                  />
                </div>
              ))}
            </div>
          )}

          {images.length >= 4 && (
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 3).map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "rounded-lg overflow-hidden cursor-pointer",
                    index === 0 ? "col-span-2 aspect-video" : "aspect-square"
                  )}
                >
                  <ProgressiveImage
                    src={image.src}
                    alt={image.alt || `이미지 ${index + 1}`}
                    className="w-full h-full"
                    onClick={() => handleImageClick(index)}
                    lazy={lazy}
                  />
                </div>
              ))}
              <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer">
                <ProgressiveImage
                  src={images[3].src}
                  alt={images[3].alt || "이미지 4"}
                  className="w-full h-full"
                  onClick={() => handleImageClick(3)}
                  lazy={lazy}
                />
                {images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showLightbox && (
          <Lightbox
            images={images}
            currentIndex={currentImageIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            onNext={handleLightboxNext}
            onPrevious={handleLightboxPrevious}
          />
        )}
      </>
    );
  }

  // Carousel Layout
  if (layout === "carousel") {
    return (
      <>
        <div className={cn("relative", className)}>
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ maxHeight }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="flex-shrink-0 w-80 aspect-video rounded-lg overflow-hidden cursor-pointer snap-start"
              >
                <ProgressiveImage
                  src={image.src}
                  alt={image.alt || `이미지 ${index + 1}`}
                  className="w-full h-full"
                  onClick={() => handleImageClick(index)}
                  lazy={lazy}
                />
              </div>
            ))}
          </div>

          {/* Carousel navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={() => handleCarouselScroll("left")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={() => handleCarouselScroll("right")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {showLightbox && (
          <Lightbox
            images={images}
            currentIndex={currentImageIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            onNext={handleLightboxNext}
            onPrevious={handleLightboxPrevious}
          />
        )}
      </>
    );
  }

  // Masonry Layout
  if (layout === "masonry") {
    return (
      <>
        <div
          className={cn("columns-2 md:columns-3 gap-3 space-y-3", className)}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="break-inside-avoid rounded-lg overflow-hidden cursor-pointer mb-3"
            >
              <ProgressiveImage
                src={image.src}
                alt={image.alt || `이미지 ${index + 1}`}
                className="w-full"
                onClick={() => handleImageClick(index)}
                lazy={lazy}
                width={image.width}
                height={image.height}
              />
            </div>
          ))}
        </div>

        {showLightbox && (
          <Lightbox
            images={images}
            currentIndex={currentImageIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            onNext={handleLightboxNext}
            onPrevious={handleLightboxPrevious}
          />
        )}
      </>
    );
  }

  return null;
}
