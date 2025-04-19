import { notFound } from 'next/navigation';
import { getPropertyById, getSimilarProperties } from '@/lib/data/property';
import PropertyDetail from './_components/PropertyDetail';
import PropertyGallery from './_components/PropertyGallery';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const property = await getPropertyById(params.id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found',
    };
  }
  
  return {
    title: `${property.title} | Vietnam Property Platform`,
    description: property.description.substring(0, 160),
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }
  
  const similarProperties = await getSimilarProperties(property);
  
  return (
    <div className="py-8">
      <div className="mb-6">
        <Link href="/search">
          <Button variant="outline" size="sm">
            ← Back to Search
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery property={property} />
          <PropertyDetail property={property} />
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          {/* Contact information card */}
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <p className="mb-2">
              <span className="font-medium">Agent:</span> John Doe
            </p>
            <p className="mb-2">
              <span className="font-medium">Phone:</span> +84 123 456 789
            </p>
            <p className="mb-4">
              <span className="font-medium">Email:</span> john.doe@example.com
            </p>
            <Button className="w-full">Contact Agent</Button>
          </div>
          
          {/* Similar properties */}
          {similarProperties.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {similarProperties.map((similarProperty) => (
                  <Link 
                    key={similarProperty.id} 
                    href={`/properties/${similarProperty.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                      <h4 className="font-medium line-clamp-1">{similarProperty.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {similarProperty.address}
                      </p>
                      <p className="font-medium mt-2">
                        ${similarProperty.price.toLocaleString()}
                        {similarProperty.property_type === '월세' ? '/month' : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
