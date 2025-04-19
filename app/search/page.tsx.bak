import { Suspense } from 'react';
import Link from 'next/link';
import Container from '@/components/Container';
import PropertySearchForm from '@/components/search/PropertySearchForm';
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton';
import { getPropertyListings } from '@/lib/data/property-listing';
import { PropertyListings } from '@/components/property/PropertyListings';
import { PropertyDataProvider } from '@/components/providers/PropertyDataProvider';
import { PropertySearchParams } from '@/types/property';

// This component handles the actual data fetching and rendering
async function SearchResults({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // Check if we have any search parameters
  const hasSearchParams = Object.keys(searchParams).length > 0;

  if (!hasSearchParams) {
    return (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Start Your Search</h2>
        <p className="text-muted-foreground">
          Use the search form to find properties that match your criteria.
        </p>
      </div>
    );
  }

  // Parse search parameters
  const params: PropertySearchParams = {
    searchText: searchParams.search,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    propertyType: searchParams.propertyType as any,
    minBedrooms: searchParams.minBedrooms ? Number(searchParams.minBedrooms) : undefined,
    minBathrooms: searchParams.minBathrooms ? Number(searchParams.minBathrooms) : undefined,
    lat: searchParams.lat ? Number(searchParams.lat) : undefined,
    lng: searchParams.lng ? Number(searchParams.lng) : undefined,
    radiusMeters: searchParams.radiusMeters ? Number(searchParams.radiusMeters) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : 12,
    offset: searchParams.offset ? Number(searchParams.offset) : 0,
  };

  // Fetch property listings with proper count
  const { data: properties, total, hasMore } = await getPropertyListings(params);

  return <PropertyListings properties={properties} total={total} initialLimit={12} hasMore={hasMore} />;
}

// Loading fallback component
function SearchResultsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Main page component
export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // Convert searchParams to a regular object for the provider
  const initialSearchParams: Record<string, string> = {};
  Object.entries(searchParams).forEach(([key, value]) => {
    initialSearchParams[key] = value.toString();
  });
  return (
    <Container>
      <PropertyDataProvider initialSearchParams={initialSearchParams}>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-8">Property Search</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search Form */}
            <div className="lg:col-span-4">
              <PropertySearchForm className="sticky top-8" />
            </div>

            {/* Search Results */}
            <div className="lg:col-span-8">
              <Suspense fallback={<SearchResultsLoading />}>
                <SearchResults searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </PropertyDataProvider>
    </Container>
  );
}
