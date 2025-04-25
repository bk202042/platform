"use client";

import { useState, useEffect } from "react";
import { PropertyListing } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card"; // Removed unused Card parts
import { Button } from "@/components/ui/button";
// Removed unused Link import
import { PropertyCard } from "@/components/property/PropertyCard"; // Corrected to named import

interface SearchResultsProps {
  searchParams: Record<string, string>;
  className?: string;
}

interface SearchResponse {
  success: boolean;
  data: PropertyListing[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function SearchResults({
  searchParams,
  className,
}: SearchResultsProps) {
  const [results, setResults] = useState<PropertyListing[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (params: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/properties?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data: SearchResponse = await response.json();

      if (!data.success) {
        // Throw a generic error as 'message' might not exist on the response
        throw new Error("API returned unsuccessful status");
      }

      setResults(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(searchParams);
  }, [searchParams]);

  const loadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    const newParams = {
      ...searchParams,
      offset: newOffset.toString(),
    };

    fetchResults(newParams);
  };

  if (loading && results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              No properties found matching your criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {pagination.total}{" "}
          {pagination.total === 1 ? "Property" : "Properties"} Found
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Removed the internal PropertyCard definition
