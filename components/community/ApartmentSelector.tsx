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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <Building size={16} className="text-zinc-600" />
        아파트 선택
      </div>

      {/* Two-step selection container */}
      <div className="space-y-4">
        {/* Step 1: City Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs font-medium text-zinc-700 tracking-normal">
            <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-gradient-to-r from-[#007882] to-[#00a0b0] rounded-lg shadow-sm">
              1
            </div>
            <span>도시 선택</span>
          </div>
          <Select value={selectedCityId} onValueChange={handleCitySelect}>
            <SelectTrigger className="w-full h-12 border-zinc-200 bg-white hover:border-zinc-300 focus:border-[#007882] focus:ring-2 focus:ring-[#007882]/20 transition-all duration-200">
              <SelectValue placeholder="도시를 먼저 선택해주세요" />
            </SelectTrigger>
            <SelectContent className="border-zinc-200 bg-white">
              {cityOptionsWithCounts.map(city => (
                <SelectItem key={city.id} value={city.id} className="hover:bg-zinc-50 focus:bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-500" />
                    <span className="text-zinc-800">{getCityDisplayName(city)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Apartment Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs font-medium text-zinc-700 tracking-normal">
            <div className={`flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 ${
              isApartmentSelectorEnabled 
                ? 'text-white bg-gradient-to-r from-[#007882] to-[#00a0b0]' 
                : 'text-zinc-500 bg-white border-2 border-zinc-200'
            }`}>
              2
            </div>
            <span>아파트 선택</span>
          </div>
          <Select 
            value={selectedApartmentId} 
            onValueChange={handleApartmentSelect}
            disabled={!isApartmentSelectorEnabled}
          >
            <SelectTrigger className={`w-full h-12 transition-all duration-200 ${
              isApartmentSelectorEnabled 
                ? 'border-zinc-200 bg-white hover:border-zinc-300 focus:border-[#007882] focus:ring-2 focus:ring-[#007882]/20' 
                : 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
            }`}>
              <SelectValue placeholder={
                isApartmentSelectorEnabled 
                  ? "아파트를 선택해주세요" 
                  : "먼저 도시를 선택해주세요"
              } />
            </SelectTrigger>
            <SelectContent className="border-zinc-200 bg-white">
              {selectedCityId === "all" && (
                <SelectItem value="all" className="hover:bg-zinc-50 focus:bg-zinc-50">
                  <span className="text-zinc-800">전체 아파트</span>
                </SelectItem>
              )}
              {filteredApartments.map(apt => (
                <SelectItem key={apt.id} value={apt.id} className="hover:bg-zinc-50 focus:bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-zinc-500" />
                    <span className="text-zinc-800">{getApartmentDisplayName(apt)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Summary */}
        {selectedCityId && selectedApartmentId && selectedApartmentId !== "all" && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#007882]/5 to-[#00a0b0]/5 border border-[#007882]/20 rounded-xl">
            <div className="text-sm text-[#006670]">
              <span className="font-semibold">선택된 위치:</span>{" "}
              <span className="font-medium">
                {(() => {
                  const selectedApt = filteredApartments.find(apt => apt.id === selectedApartmentId);
                  const selectedCity = cityOptionsWithCounts.find(city => city.id === selectedCityId);
                  return selectedApt && selectedCity ? 
                    `${selectedCity.name_ko || selectedCity.name} - ${getApartmentDisplayName(selectedApt)}` : 
                    "";
                })()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}