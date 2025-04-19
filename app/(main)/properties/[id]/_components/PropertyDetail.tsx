'use client';

import { PropertyListing } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyDetailProps {
  property: PropertyListing;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  // Format price based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === '월세') {
      return `$${price.toLocaleString()}/month`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{property.title}</CardTitle>
        <p className="text-muted-foreground">{property.address}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-3xl font-bold">
              {formatPrice(property.price, property.property_type)}
            </p>
            <p className="text-muted-foreground">
              {property.property_type === '월세' ? 'Monthly Rent (월세)' : 'Purchase (매매)'}
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-2xl font-semibold">{property.bedrooms}</p>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{property.bathrooms}</p>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{property.square_footage}</p>
              <p className="text-sm text-muted-foreground">Sq Ft</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
        </div>

        {property.features && property.features.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {property.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
