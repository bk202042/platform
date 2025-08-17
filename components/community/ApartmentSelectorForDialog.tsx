"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Component-specific interfaces that extend database types
export interface ApartmentSelectOption {
  id: string;
  name: string;
  name_ko?: string;
  city_id: string;
  district?: string;
  district_ko?: string;
}

export interface CitySelectOption {
  id: string;
  name: string;
  name_ko?: string;
}

interface ApartmentSelectorForDialogProps {
  onApartmentSelect: (apartmentId: string) => void;
  value: string;
  className?: string;
  cities: CitySelectOption[];
  apartments: ApartmentSelectOption[];
  "aria-label"?: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function ApartmentSelectorForDialog({
  onApartmentSelect,
  value,
  className,
  cities,
  apartments,
  ...ariaProps
}: ApartmentSelectorForDialogProps) {
  // Group apartments by city for better organization
  const apartmentsByCity = apartments.reduce((acc, apt) => {
    const city = cities.find(c => c.id === apt.city_id);
    const cityName = city?.name || city?.name_ko || "기타";
    if (!acc[cityName]) {
      acc[cityName] = {
        city: city,
        apartments: []
      };
    }
    acc[cityName].apartments.push(apt);
    return acc;
  }, {} as Record<string, { city: CitySelectOption | undefined; apartments: ApartmentSelectOption[] }>);

  // Sort cities and apartments within each city
  const sortedCities = Object.keys(apartmentsByCity).sort();
  
  // Sort apartments within each city
  Object.values(apartmentsByCity).forEach(cityGroup => {
    cityGroup.apartments.sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <Select value={value} onValueChange={onApartmentSelect}>
      <SelectTrigger 
        className={cn("w-full", className)}
        aria-label={ariaProps["aria-label"]}
        aria-required={ariaProps["aria-required"]}
        aria-invalid={ariaProps["aria-invalid"]}
        aria-describedby={ariaProps["aria-describedby"]}
      >
        <SelectValue placeholder="🏢 아파트를 검색하고 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {sortedCities.map(cityName => {
          const cityGroup = apartmentsByCity[cityName];
          return (
            <div key={cityName}>
              {/* City header - disabled item for visual grouping */}
              <SelectItem 
                value={`city-header-${cityName}`} 
                disabled 
                className="font-medium text-gray-500 bg-gray-50 text-xs uppercase tracking-wide"
              >
                📍 {cityName}
              </SelectItem>
              {/* Apartments in this city */}
              {cityGroup.apartments.map(apartment => (
                <SelectItem key={apartment.id} value={apartment.id} className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-medium">{apartment.name}</span>
                    {apartment.district && (
                      <span className="text-xs text-gray-500">{apartment.district}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </div>
          );
        })}
      </SelectContent>
    </Select>
  );
}