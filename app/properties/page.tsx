import { Suspense } from 'react';
import { Metadata } from 'next';
import { getPropertyListings } from '@/lib/data/property-listing';
import Container from '@/components/Container';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton';
import { PropertySearchParams } from '@/types/property';

// Generate metadata for the properties page
export const metadata: Metadata = {
  title: 'Property Listings | Find Your Dream Home in Vietnam',
  description: 'Browse our curated selection of properties for rent and sale in Vietnam. Find apartments, houses, and villas in popular locations with features tailored for Korean expatriates.',
  openGraph: {
    title: 'Property Listings | Find Your Dream Home in Vietnam',
    description: 'Browse our curated selection of properties for rent and sale in Vietnam. Find apartments, houses, and villas in popular locations with features tailored for Korean expatriates.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Property Listings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

// This component handles the actual data fetching and rendering
async function PropertyListings({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
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
          {total} {total === 1 ? 'Property' : 'Properties'} Found
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showDistance={'distance_meters' in property}
            distanceMeters={'distance_meters' in property ? (property as any).distance_meters : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// Loading fallback component
function PropertyListingsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Main page component
export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Property Listings</h1>

        <Suspense fallback={<PropertyListingsLoading />}>
          <PropertyListings searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
