"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface PropertyImageGalleryProps {
  images: string[];
  alt: string;
}

export function PropertyImageGallery({
  images,
  alt,
}: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // If no images are provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <>
      {/* Main gallery view */}
      <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />

        {/* Navigation buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous image</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>

        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-5 w-5" />
          <span className="sr-only">View fullscreen</span>
        </Button>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2",
              index === currentIndex ? "border-primary" : "border-transparent",
            )}
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={image}
              alt={`${alt} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
          <div className="relative w-full max-w-5xl h-full max-h-screen p-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80"
              onClick={toggleFullscreen}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close fullscreen</span>
            </Button>

            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex]}
                alt={`${alt} - Fullscreen Image ${currentIndex + 1}`}
                fill
                className="object-contain"
              />

              {/* Navigation buttons */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous image</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                  <span className="sr-only">Next image</span>
                </Button>
              </div>

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
