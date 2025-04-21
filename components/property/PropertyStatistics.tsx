"use client";

import { Home, Building, MapPin } from "lucide-react";

interface PropertyStatisticsProps {
  totalProperties: number;
}

export function PropertyStatistics({
  totalProperties,
}: PropertyStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-muted rounded-lg p-6 flex items-center">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{totalProperties}</h3>
          <p className="text-muted-foreground">Total Properties</p>
        </div>
      </div>
      <div className="bg-muted rounded-lg p-6 flex items-center">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">5</h3>
          <p className="text-muted-foreground">Cities</p>
        </div>
      </div>
      <div className="bg-muted rounded-lg p-6 flex items-center">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">24/7</h3>
          <p className="text-muted-foreground">Support Available</p>
        </div>
      </div>
    </div>
  );
}
