import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyById, getSimilarProperties } from '@/lib/data/property-listing';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyImageGallery } from '@/components/property/PropertyImageGallery';
import { PropertyFeatures } from '@/components/property/PropertyFeatures';
import { PropertyLocation } from '@/components/property/PropertyLocation';
import { PropertyContact } from '@/components/property/PropertyContact';
import { SimilarProperties } from '@/components/property/SimilarProperties';

// Format price based on property type
const formatPrice = (price: number, type: string) => {
  if (type === '월세') {
    return `$${price.toLocaleString()}/month`;
  } else {
    return `$${price.toLocaleString()}`;
  }
};

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

// This component handles the actual data fetching and rendering
async function PropertyDetails({ id }: { id: string }) {
  // Fetch property details
  const property = await getPropertyById(id);

  // If property is null, it means it doesn't exist
  if (!property) {
    notFound();
  }

  // Fetch similar properties
  const similarProperties = await getSimilarProperties(property);

  // Mock images for the gallery (in a real app, these would come from the database)
  const mockImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1470&auto=format&fit=crop'
  ];

  return (
    <div className="py-8">
      <div className="mb-6">
        <Link href="/properties">
          <Button variant="outline" size="sm">
            ← Back to Properties
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-xl mb-6">{property.address}</p>

          {/* Property Image Gallery */}
          <PropertyImageGallery images={mockImages} alt={property.title} />

          <div className="mt-8">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">About This Property</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-2xl font-semibold">{property.bedrooms}</p>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-2xl font-semibold">{property.bathrooms}</p>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-2xl font-semibold">{property.square_footage}</p>
                      <p className="text-sm text-muted-foreground">Sq Ft</p>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-2xl font-semibold">{property.property_type}</p>
                      <p className="text-sm text-muted-foreground">Type</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Property Features</h2>
                  <PropertyFeatures features={property.features} />
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Location</h2>
                  <PropertyLocation
                    address={property.address}
                    lat={property.location?.lat}
                    lng={property.location?.lng}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Similar Properties Section */}
          <div className="mt-12">
            <SimilarProperties properties={similarProperties} />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-6">
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
                </div>
              </CardContent>
            </Card>

            <PropertyContact propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PropertyDetailsLoading() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <div className="h-9 w-32 bg-muted rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="h-10 w-3/4 bg-muted rounded-md animate-pulse mb-2"></div>
          <div className="h-6 w-1/2 bg-muted rounded-md animate-pulse mb-6"></div>

          <div className="h-96 bg-muted rounded-lg animate-pulse mb-8"></div>

          <div className="space-y-8">
            <div>
              <div className="h-8 w-40 bg-muted rounded-md animate-pulse mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse"></div>
              </div>
            </div>

            <div>
              <div className="h-8 w-32 bg-muted rounded-md animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-6 bg-muted rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 w-1/2 bg-muted rounded-md"></div>
              <div className="h-4 w-1/3 bg-muted rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="h-8 w-8 bg-muted rounded-md mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-muted rounded-md mx-auto"></div>
                  </div>
                  <div>
                    <div className="h-8 w-8 bg-muted rounded-md mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-muted rounded-md mx-auto"></div>
                  </div>
                  <div>
                    <div className="h-8 w-8 bg-muted rounded-md mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-muted rounded-md mx-auto"></div>
                  </div>
                </div>

                <div className="h-9 w-full bg-muted rounded-md"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Container>
      <Suspense fallback={<PropertyDetailsLoading />}>
        <PropertyDetails id={params.id} />
      </Suspense>
    </Container>
  );
}
