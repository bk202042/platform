"use client";

import { useState } from "react";
import Image from "next/image";
import { PropertyListing, PropertyImage } from "@/lib/types/property"; // Import PropertyImage
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface PropertyGalleryProps {
  // Expect the property object which includes the processed property_images array
  property: PropertyListing & {
    property_images?: (PropertyImage & { publicUrl: string | null })[];
  };
}

export default function PropertyGallery({ property }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use the processed property_images array
  const images = property.property_images?.length
    ? property.property_images
    : // Provide a default structure if no images exist
      [
        {
          storage_path: "",
          publicUrl: "/assets/images/property-placeholder.jpg",
        } as PropertyImage,
      ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Ensure images array is not empty before accessing index
  const currentImageUrl =
    images[currentImageIndex]?.publicUrl ||
    "/assets/images/property-placeholder.jpg";
  const currentImageAlt =
    images[currentImageIndex]?.alt_text ||
    `매물 이미지 ${currentImageIndex + 1}`;

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-2 sm:p-4">
      {/* Price badge (example, can be replaced with dynamic value) */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-block bg-[#eaf6f3] text-[#007882] text-sm font-semibold px-4 py-1 rounded-full shadow-sm border border-[#b2e2d6]">
          판매 중
        </span>
      </div>
      {/* Main Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-100">
        <Image
          src={currentImageUrl}
          alt={currentImageAlt}
          fill
          className="object-cover"
          priority={currentImageIndex === 0}
          sizes="100vw"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
          onClick={() => setIsFullscreen(true)}
          aria-label="전체 화면으로 보기"
        >
          <Expand className="h-5 w-5" />
        </Button>
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
              onClick={previousImage}
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
              onClick={nextImage}
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
        <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-[#007882] text-sm border border-gray-200 shadow-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || `thumb-${index}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? "border-[#007882]" : "border-gray-200"}`}
              aria-label={`이미지 ${index + 1} 보기`}
            >
              <Image
                src={
                  image.publicUrl || "/assets/images/property-placeholder.jpg"
                }
                alt={image.alt_text || `썸네일 ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-white rounded-2xl">
            <Image
              src={currentImageUrl}
              alt={currentImageAlt}
              fill
              className="object-contain rounded-2xl"
              sizes="100vw"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
              onClick={() => setIsFullscreen(false)}
              aria-label="전체 화면 닫기"
            >
              <X className="h-5 w-5" />
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
                  onClick={previousImage}
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#007882] border border-gray-200 shadow-sm"
                  onClick={nextImage}
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-[#007882] text-sm border border-gray-200 shadow-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
