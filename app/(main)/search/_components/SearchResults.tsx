'use client';

import { useState, useEffect } from 'react';
import { PropertyListing } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function SearchResults({ searchParams, className }: SearchResultsProps) {
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
        throw new Error('Failed to fetch properties');
      }
      
      const data: SearchResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch properties');
      }
      
      setResults(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {pagination.total} {pagination.total === 1 ? 'Property' : 'Properties'} Found
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

function PropertyCard({ property }: { property: PropertyListing }) {
  // Format price based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === '월세') {
      return `$${price.toLocaleString()}/month`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
        <CardDescription>
          {property.address}
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
