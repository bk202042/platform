"use client";

import { PropertyListing } from "@/lib/types/property";
import { Heart, MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";

interface PropertyDetailProps {
  property: PropertyListing;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  // Format price based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === "월세") {
      return `$${price.toLocaleString()}/월`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {property.title}
          </h1>
          <button
            className="ml-2 p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-[#007882] shadow-sm transition-colors"
            aria-label="매물 저장"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#E94F1D]">
            {formatPrice(property.price, property.property_type)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground font-medium">
            {property.property_type === "월세" ? "월세" : "매매"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {property.address}
        </span>
        <span className="flex items-center gap-1">
          <BedDouble className="h-4 w-4" />
          {property.bedrooms} 침실
        </span>
        <span className="flex items-center gap-1">
          <Bath className="h-4 w-4" />
          {property.bathrooms} 욕실
        </span>
        <span className="flex items-center gap-1">
          <Maximize2 className="h-4 w-4" />
          {property.square_footage} 평방피트
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">설명</h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {property.description}
        </p>
      </div>
      {/* Features (legacy, keep for compatibility) */}
      {Array.isArray(property.features) && property.features.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">특징</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {property.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
