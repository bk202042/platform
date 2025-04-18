'use client';

import { memo } from 'react';
import Link from 'next/link';
import { PropertyListing } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  property: PropertyListing;
  showDistance?: boolean;
  distanceMeters?: number;
}

// Format price based on property type
const formatPrice = (price: number, type: string) => {
  if (type === '월세') {
    return `$${price.toLocaleString()}/month`;
  } else {
    return `$${price.toLocaleString()}`;
  }
};

// Format distance in a human-readable way
const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${meters.toFixed(0)}m away`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)}km away`;
  }
};

function PropertyCardComponent({ property, showDistance = false, distanceMeters }: PropertyCardProps) {
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
        <CardDescription>
          {property.address}
          {showDistance && distanceMeters && (
            <span className="ml-2 text-xs font-medium text-primary">
              {formatDistance(distanceMeters)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2">
          <p className="font-semibold text-lg">
            {formatPrice(property.price, property.property_type)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {property.property_type === '월세' ? 'Monthly Rent' : 'Purchase'}
            </span>
          </p>
          <div className="flex space-x-4 text-sm">
            <div>{property.bedrooms} <span className="text-muted-foreground">Bed</span></div>
            <div>{property.bathrooms} <span className="text-muted-foreground">Bath</span></div>
            <div>{property.square_footage} <span className="text-muted-foreground">sqft</span></div>
          </div>
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {property.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/properties/${property.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const PropertyCard = memo(PropertyCardComponent);
