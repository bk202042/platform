"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PropertyListing, PropertyImage } from '@/types/property'; // Import PropertyImage
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface PropertyGalleryProps {
  // Expect the property object which includes the processed property_images array
  property: PropertyListing & { property_images?: (PropertyImage & { publicUrl: string | null })[] };
}

export default function PropertyGallery({ property }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use the processed property_images array
  const images = property.property_images?.length
    ? property.property_images
    // Provide a default structure if no images exist
    : [{ storage_path: '', publicUrl: '/assets/images/property-placeholder.jpg' } as PropertyImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Ensure images array is not empty before accessing index
  const currentImageUrl = images[currentImageIndex]?.publicUrl || '/assets/images/property-placeholder.jpg';
  const currentImageAlt = images[currentImageIndex]?.alt_text || `Property image ${currentImageIndex + 1}`;

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image
          src={currentImageUrl}
          alt={currentImageAlt}
          fill
          className="object-cover"
          priority={currentImageIndex === 0} // Prioritize loading the first image
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
          onClick={() => setIsFullscreen(true)}
          aria-label="View fullscreen"
        >
          <Expand className="h-5 w-5" />
        </Button>
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={previousImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
        <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              // Use image id if available and valid, otherwise index
              key={image.id || `thumb-${index}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden ${
                currentImageIndex === index ? 'ring-2 ring-primary' : ''
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.publicUrl || '/assets/images/property-placeholder.jpg'} // Use publicUrl field
                alt={image.alt_text || `Thumbnail ${index + 1}`} // Use alt_text
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full">
            <Image
              src={currentImageUrl} // Use variable for current image URL
              alt={currentImageAlt} // Use variable for current image alt text
              fill
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
            >
              <X className="h-5 w-5" />
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={previousImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
