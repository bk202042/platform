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
        {apartments.map(apartment => {
          const city = cities.find(c => c.id === apartment.city_id);
          return (
            <SelectItem key={apartment.id} value={apartment.id}>
              {city?.name}, {apartment.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}