'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FeaturedPropertyTabs } from '@/components/property/FeaturedPropertyTabs';
import { PropertyStatistics } from '@/components/property/PropertyStatistics';
import { PropertyListing } from '@/types/property';

interface FeaturedPropertiesSectionProps {
  rentProperties: PropertyListing[];
  buyProperties: PropertyListing[];
  totalProperties: number;
}

export function FeaturedPropertiesSection({ 
  rentProperties, 
  buyProperties,
  totalProperties
}: FeaturedPropertiesSectionProps) {
  return (
    <section className="container mx-auto px-4 mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
        <div className="flex justify-between items-center">
          <p className="text-lg text-muted-foreground">
            Discover our handpicked selection of properties in Vietnam
          </p>
          <Link href="/properties">
            <Button variant="outline">View All Properties</Button>
          </Link>
        </div>
      </div>

      {/* Property Tabs */}
      <FeaturedPropertyTabs
        rentProperties={rentProperties}
        buyProperties={buyProperties}
      />

      {/* Property Statistics */}
      <PropertyStatistics totalProperties={totalProperties} />
    </section>
  );
}
