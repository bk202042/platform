"use client";

import { PropertyListing } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bath, BedDouble, Home, Maximize, Wifi } from 'lucide-react';

interface PropertyFeaturesProps {
  property: PropertyListing;
}

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const featureSections = {
    interior: [
      { icon: BedDouble, label: `${property.bedrooms} Bedrooms` },
      { icon: Bath, label: `${property.bathrooms} Bathrooms` },
      { icon: Maximize, label: `${property.square_footage} Sq Ft` },
      { icon: Home, label: 'Modern Kitchen' },
      { icon: Wifi, label: 'High-Speed Internet' },
    ],
    building: [
      'Elevator Access',
      'Fitness Center',
      'Package Receiving',
      'Security System',
      'Parking Available',
    ],
    exterior: [
      'Private Balcony',
      'Garden Access',
      'BBQ Area',
      'Swimming Pool',
      'Children\'s Playground',
    ],
    additional: [
      '24/7 Security',
      'Pet Friendly',
      'Close to Public Transport',
      'Near International Schools',
      'Shopping Centers Nearby',
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Interior Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Interior Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureSections.interior.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Building Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Building Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.building.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Exterior Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Exterior Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.exterior.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {featureSections.additional.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
