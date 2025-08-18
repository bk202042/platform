"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building, MapPin } from "lucide-react";
import { useTwoStepApartmentSelector } from "@/hooks/useTwoStepApartmentSelector";
import { useMemo } from "react";

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
  // Transform apartments data to match hook interface
  const { cities, apartmentOptions } = useMemo(() => {
    const cityMap = new Map<string, { id: string; name: string; name_ko?: string }>();
    const apartmentOpts = apartments.map(apt => {
      const cityInfo = apt.cities;
      if (cityInfo && !cityMap.has(apt.city_id)) {
        cityMap.set(apt.city_id, {
          id: apt.city_id,
          name: cityInfo.name,
          name_ko: cityInfo.name_ko
        });
      }
      return {
        id: apt.id,
        name: apt.name,
        name_ko: apt.name_ko,
        city_id: apt.city_id
      };
    });

    return {
      cities: Array.from(cityMap.values()),
      apartmentOptions: apartmentOpts
    };
  }, [apartments]);

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
    apartments: apartmentOptions,
    initialSelectedApartmentId: selectedId,
    onApartmentSelect: onSelect,
    includeAllOption: true
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Building size={16} />
        아파트 선택
      </div>

      {/* Two-step selection container */}
      <div className="space-y-3">
        {/* Step 1: City Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">1</span>
            도시 선택
          </div>
          <Select value={selectedCityId} onValueChange={handleCitySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="도시를 먼저 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {cityOptionsWithCounts.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{getCityDisplayName(city)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Apartment Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
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
            <SelectTrigger className={`w-full transition-opacity ${
              isApartmentSelectorEnabled ? 'opacity-100' : 'opacity-50'
            }`}>
              <SelectValue placeholder={
                isApartmentSelectorEnabled 
                  ? "아파트를 선택해주세요" 
                  : "먼저 도시를 선택해주세요"
              } />
            </SelectTrigger>
            <SelectContent>
              {selectedCityId === "all" && (
                <SelectItem value="all">전체 아파트</SelectItem>
              )}
              {filteredApartments.map(apt => (
                <SelectItem key={apt.id} value={apt.id}>
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-gray-400" />
                    <span>{getApartmentDisplayName(apt)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Summary */}
        {selectedCityId && selectedApartmentId && selectedApartmentId !== "all" && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">선택됨:</span>{" "}
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