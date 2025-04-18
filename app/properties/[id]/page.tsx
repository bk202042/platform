'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyListing } from '@/types/property';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/properties/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          throw new Error('Failed to fetch property details');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch property details');
        }
        
        setProperty(data.data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);
  
  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (error || !property) {
    return (
      <Container>
        <div className="py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-muted-foreground mb-6">{error || 'Property not found'}</p>
                <Link href="/search">
                  <Button>Back to Search</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
  
  // Format price based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === '월세') {
      return `$${price.toLocaleString()}/month`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };
  
  return (
    <Container>
      <div className="py-8">
        <div className="mb-6">
          <Link href="/search">
            <Button variant="outline" size="sm">
              ← Back to Search
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-xl mb-6">{property.address}</p>
            
            {/* Property Image Placeholder */}
            <div className="bg-muted h-96 rounded-lg mb-8 flex items-center justify-center">
              <p className="text-muted-foreground">Property Image</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(property.features).map(([key, value]) => {
                    if (value === true) {
                      return (
                        <div key={key} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          <span>{formatFeatureName(key)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {formatPrice(property.price, property.property_type)}
                </CardTitle>
                <CardDescription>
                  {property.property_type === '월세' ? 'Monthly Rent' : 'Purchase'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold">{property.bedrooms}</p>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{property.bathrooms}</p>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{property.square_footage}</p>
                      <p className="text-sm text-muted-foreground">Sq Ft</p>
                    </div>
                  </div>
                  
                  <Button className="w-full">Contact Agent</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

// Helper function to format feature names
function formatFeatureName(key: string): string {
  // Convert camelCase to Title Case with spaces
  const formatted = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  
  // Special cases for Korean-specific features
  if (key.startsWith('korean')) {
    return formatted.replace('Korean', 'Korean ');
  }
  
  return formatted;
}
