"use client";

import { useState } from "react";
import { PropertyListing } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyGalleryProps {
  property: PropertyListing;
}

export default function PropertyGallery({ property }: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // For now, we'll use placeholder images
  const images = [
    `https://placehold.co/800x500/e2e8f0/1e293b?text=${encodeURIComponent(property.title)}`,
    `https://placehold.co/800x500/e2e8f0/1e293b?text=Bedroom`,
    `https://placehold.co/800x500/e2e8f0/1e293b?text=Kitchen`,
    `https://placehold.co/800x500/e2e8f0/1e293b?text=Bathroom`,
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={`Property image ${selectedImage + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedImage === index
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`Property thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
