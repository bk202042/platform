"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Building, MapPin } from "lucide-react";
import { useTwoStepApartmentSelector } from "@/hooks/useTwoStepApartmentSelector";

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
  const {
    selectedCityId,
    selectedApartmentId,
    filteredApartments,
    cityOptionsWithCounts,
    isApartmentSelectorEnabled,
    handleCitySelect,
    handleApartmentSelect,
    getCityDisplayName,
    getApartmentDisplayName
  } = useTwoStepApartmentSelector({
    cities,
    apartments,
    initialSelectedApartmentId: value,
    onApartmentSelect,
    includeAllOption: false
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Two-step selection container */}
      <div className="space-y-3">
        {/* Step 1: City Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
            <span className="flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-blue-500 rounded-full">1</span>
            도시 선택
          </div>
          <Select value={selectedCityId} onValueChange={handleCitySelect}>
            <SelectTrigger 
              className="w-full"
              aria-label="도시 선택"
              aria-required={ariaProps["aria-required"]}
            >
              <SelectValue placeholder="도시를 먼저 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {cityOptionsWithCounts.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm">{getCityDisplayName(city)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Apartment Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
            <span className={`flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full transition-colors ${
              isApartmentSelectorEnabled 
                ? 'text-white bg-blue-500' 
                : 'text-gray-400 bg-gray-200'
            }`}>2</span>
            아파트 선택
          </div>
          <Select 
            value={selectedApartmentId} 
            onValueChange={handleApartmentSelect}
            disabled={!isApartmentSelectorEnabled}
          >
            <SelectTrigger 
              className={`w-full transition-all duration-200 ${
                isApartmentSelectorEnabled ? 'opacity-100' : 'opacity-50'
              }`}
              aria-label={ariaProps["aria-label"] || "아파트 선택"}
              aria-required={ariaProps["aria-required"]}
              aria-invalid={ariaProps["aria-invalid"]}
              aria-describedby={ariaProps["aria-describedby"]}
            >
              <SelectValue placeholder={
                isApartmentSelectorEnabled 
                  ? "🏢 아파트를 검색하고 선택하세요" 
                  : "먼저 도시를 선택해주세요"
              } />
            </SelectTrigger>
            <SelectContent>
              {filteredApartments.map(apartment => (
                <SelectItem key={apartment.id} value={apartment.id}>
                  <div className="flex items-start gap-2">
                    <Building size={14} className="text-gray-400 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">
                        {getApartmentDisplayName(apartment)}
                      </span>
                      {apartment.district && (
                        <span className="text-xs text-gray-500 truncate">
                          {apartment.district_ko || apartment.district}
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Compact Selection Summary for Dialog */}
        {selectedCityId && selectedApartmentId && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="text-xs text-green-800">
              <span className="font-medium">✓ 선택완료:</span>{" "}
              {(() => {
                const selectedApt = filteredApartments.find(apt => apt.id === selectedApartmentId);
                const selectedCity = cityOptionsWithCounts.find(city => city.id === selectedCityId);
                return selectedApt && selectedCity ? 
                  `${selectedCity.name_ko || selectedCity.name} - ${getApartmentDisplayName(selectedApt)}` : 
                  "";
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}