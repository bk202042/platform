"use client";

import { MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

interface QuickLocationSwitcherProps {
  currentLocation?: LocationSearchResult | null;
  onLocationSelect: (location: LocationSearchResult) => void;
  className?: string;
  locations?: LocationSearchResult[];
  isLoading?: boolean;
}

export function QuickLocationSwitcher({
  currentLocation,
  onLocationSelect,
  className = "",
  locations = [],
  isLoading = false,
}: QuickLocationSwitcherProps) {
  const quickLocations = locations.slice(0, 4);

  const handleLocationClick = (location: LocationSearchResult) => {
    onLocationSelect(location);
  };

  if (isLoading) {
    return (
      <div className={cn("px-4 py-3 bg-white border-b border-zinc-200", className)}>
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-4 py-3 bg-white border-b border-zinc-200", className)}>
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        {quickLocations.map((location) => {
          const isSelected = currentLocation?.id === location.id;
          const locationName = location.name_ko || location.name;
          
          return (
            <Button
              key={location.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleLocationClick(location)}
              className={cn(
                "flex-shrink-0 h-8 px-3 text-sm font-medium rounded-full transition-all duration-200",
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                  : "bg-white text-zinc-700 border-zinc-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
              )}
            >
              <div className="flex items-center space-x-1.5">
                {location.type === "city" ? (
                  <MapPin className="h-3 w-3" />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
                <span className="truncate max-w-20">{locationName}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}