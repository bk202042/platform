import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import PropertyDetail from './_components/PropertyDetail';
import PropertyGallery from './_components/PropertyGallery';
import PropertyFeatures from './_components/PropertyFeatures';
import PropertyCosts from './_components/PropertyCosts';
import RequestInfoForm from './_components/RequestInfoForm';
import { getPropertyById, getPropertyListings } from '@/lib/data/property';

// Generate metadata for the property page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  // Await the params Promise to get the ID
  const resolvedParams = await params;
  const property = await getPropertyById(resolvedParams.id);

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.'
    };
  }

  return {
    title: `${property.title} | Vietnam Property Platform`,
    description: property.description?.substring(0, 160) || `View details for ${property.title} located in ${property.address}`
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params Promise to get the ID
  const resolvedParams = await params;

  // Fetch the property data using the ID from URL params
  const property = await getPropertyById(resolvedParams.id);

  // If property is not found, trigger the not-found page
  if (!property) {
    notFound();
  }

  // Fetch similar properties (optional) - using same property type with different ID
  // Only fetch properties of the same type, and we'll filter out the current one client-side
  const similarPropertiesResult = await getPropertyListings({
    propertyType: property.property_type,
    limit: 4 // Request one extra since we'll filter one out
  });

  // Filter out the current property from the results and limit to 3 max
  const similarProperties = (similarPropertiesResult.data || [])
    .filter(p => p.id !== property.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="container mx-auto py-10">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300 bg-white shadow-sm hover:bg-gray-50"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
              <PropertyGallery property={property} />
            </div>
            {/* Property details */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <PropertyDetail property={property} />
            </div>
            {/* Features */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Property Features</h2>
              <PropertyFeatures property={property} />
            </div>
          </div>
          {/* Right column - Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Request Info card */}
              <Card className="p-6 border border-gray-200 rounded-2xl shadow-lg bg-white">
                <RequestInfoForm property={property} />
              </Card>
              {/* Costs breakdown */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <PropertyCosts property={property} />
              </div>
              {/* Similar properties */}
              {similarProperties.length > 0 && (
                <Card className="p-6 border border-gray-200 rounded-2xl shadow-lg bg-white">
                  <h3 className="text-lg font-semibold mb-4">
                    Similar Properties
                  </h3>
                  <div className="space-y-4">
                    {similarProperties.map((similarProperty) => (
                      <Link
                        key={similarProperty.id}
                        href={`/properties/${similarProperty.id}`}
                        className="block"
                      >
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-muted transition-colors">
                          <h4 className="font-medium line-clamp-1">
                            {similarProperty.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {similarProperty.address}
                          </p>
                          <p className="font-medium mt-2">
                            ${similarProperty.price.toLocaleString()}
                            {similarProperty.property_type === '월세'
                              ? '/month'
                              : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
