"use client";

import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import { Button } from "@/components/ui/button";
import { PropertyListing } from "@/lib/types/property";

interface SimilarPropertiesProps {
  properties: PropertyListing[];
  isLoading?: boolean;
}

export function SimilarProperties({
  properties,
  isLoading = false,
}: SimilarPropertiesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Similar Properties</h2>
        <Link href="/properties">
          <Button variant="ghost">View All</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
