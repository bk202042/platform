"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import { Button } from "@/components/ui/button";
import { PropertyListing } from "@/lib/types/property";

// Extend PropertyListing to include optional distance_meters
type PropertyListingWithDistance = PropertyListing & {
  distance_meters?: number;
};

interface PropertyListingsProps {
  properties: PropertyListingWithDistance[];
  total?: number;
  initialLimit?: number;
  hasMore?: boolean;
}

export function PropertyListings({
  properties,
  total = 0,
  initialLimit = 12,
  hasMore = false,
}: PropertyListingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [limit, setLimit] = useState(initialLimit);

  // Create a new URLSearchParams object to modify
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const loadMore = () => {
    const newLimit = limit + initialLimit;
    setLimit(newLimit);

    startTransition(() => {
      router.push(
        `/properties?${createQueryString("limit", newLimit.toString())}`,
        { scroll: false },
      );
    });
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search criteria to find more properties.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {total} {total === 1 ? "Property" : "Properties"} Found
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showDistance={property.distance_meters !== undefined}
            distanceMeters={property.distance_meters}
          />
        ))}

        {isPending && (
          <>
            {Array.from({ length: initialLimit }).map((_, index) => (
              <PropertyCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={isPending}
            className="min-w-[150px]"
          >
            {isPending ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
