"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building } from "lucide-react";

interface Apartment {
  id: string;
  name: string;
  name_ko?: string;
  name_en?: string;
  city_id: string;
  cities: { name: string; name_ko?: string } | null;
}

interface ApartmentSelectorProps {
  apartments: Apartment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ApartmentSelector({ 
  apartments, 
  selectedId, 
  onSelect 
}: ApartmentSelectorProps) {
  // Group apartments by city
  const apartmentsByCity = apartments.reduce((acc, apt) => {
    const cityName = apt.cities?.name || "기타";
    if (!acc[cityName]) {
      acc[cityName] = [];
    }
    acc[cityName].push(apt);
    return acc;
  }, {} as Record<string, Apartment[]>);

  // Sort cities
  const sortedCities = Object.keys(apartmentsByCity).sort();

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Building size={16} />
        아파트 선택
      </label>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="아파트를 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 아파트</SelectItem>
          {sortedCities.map(cityName => (
            <div key={cityName}>
              {/* City header - disabled item for visual grouping */}
              <SelectItem value={`city-${cityName}`} disabled className="font-medium text-gray-500 bg-gray-50">
                📍 {cityName}
              </SelectItem>
              {/* Apartments in this city */}
              {apartmentsByCity[cityName].map(apt => (
                <SelectItem key={apt.id} value={apt.id} className="pl-6">
                  {apt.name}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}