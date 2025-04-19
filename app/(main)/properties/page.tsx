import { getPropertyListings } from '@/lib/data/property';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export const metadata = {
  title: 'All Properties | Vietnam Property Platform',
  description: 'Browse all available properties in Vietnam',
};

export default async function PropertiesPage() {
  const result = await getPropertyListings({ limit: 12 });
  
  // Format price based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === '월세') {
      return `$${price.toLocaleString()}/month`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };
  
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <Link href="/search">
          <Button>Advanced Search</Button>
        </Link>
      </div>
      
      {result.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {result.data.map((property) => (
              <Card key={property.id} className="h-full flex flex-col">
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
            ))}
          </div>
          
          {result.hasMore && (
            <div className="flex justify-center">
              <Link href="/search">
                <Button variant="outline">View More Properties</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
