"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertyLocationProps {
  address: string;
  lat?: number;
  lng?: number;
}

export function PropertyLocation({ address, lat, lng }: PropertyLocationProps) {
  const hasCoordinates = lat !== undefined && lng !== undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">{address}</p>

          {hasCoordinates ? (
            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative">
              {/* This would be replaced with an actual map component in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Map would be displayed here
                  <br />
                  Coordinates: {lat}, {lng}
                </p>
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                No map coordinates available
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Exact location provided after booking</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
