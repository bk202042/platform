"use client";

import { useState, useMemo, useCallback } from "react";

export interface CitySelectOption {
  id: string;
  name: string;
  name_ko?: string;
}

export interface ApartmentSelectOption {
  id: string;
  name: string;
  name_ko?: string;
  city_id: string;
  district?: string;
  district_ko?: string;
}

interface UseTwoStepApartmentSelectorProps {
  cities: CitySelectOption[];
  apartments: ApartmentSelectOption[];
  initialSelectedApartmentId?: string;
  onApartmentSelect: (apartmentId: string) => void;
  includeAllOption?: boolean;
}

export function useTwoStepApartmentSelector({
  cities,
  apartments,
  initialSelectedApartmentId = "",
  onApartmentSelect,
  includeAllOption = false
}: UseTwoStepApartmentSelectorProps) {
  // Find initial city based on selected apartment
  const initialCity = useMemo(() => {
    if (!initialSelectedApartmentId || initialSelectedApartmentId === "all") return "";
    const apartment = apartments.find(apt => apt.id === initialSelectedApartmentId);
    return apartment?.city_id || "";
  }, [initialSelectedApartmentId, apartments]);

  const [selectedCityId, setSelectedCityId] = useState<string>(initialCity);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>(initialSelectedApartmentId);

  // Calculate apartment counts per city
  const cityApartmentCounts = useMemo(() => {
    return apartments.reduce((acc, apt) => {
      acc[apt.city_id] = (acc[apt.city_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [apartments]);

  // Filter apartments based on selected city
  const filteredApartments = useMemo(() => {
    if (!selectedCityId || selectedCityId === "all") {
      return apartments;
    }
    return apartments.filter(apt => apt.city_id === selectedCityId);
  }, [selectedCityId, apartments]);

  // City options with counts
  const cityOptionsWithCounts = useMemo(() => {
    const options = cities.map(city => ({
      ...city,
      apartmentCount: cityApartmentCounts[city.id] || 0
    }));

    if (includeAllOption) {
      return [
        {
          id: "all",
          name: "전체 도시",
          name_ko: "전체 도시",
          apartmentCount: apartments.length
        },
        ...options
      ];
    }

    return options;
  }, [cities, cityApartmentCounts, apartments.length, includeAllOption]);

  // Handle city selection
  const handleCitySelect = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    
    // Clear apartment selection when city changes (unless it's "all")
    if (cityId !== selectedCityId) {
      if (cityId === "all" && includeAllOption) {
        // Keep current apartment selection if it exists
        onApartmentSelect(selectedApartmentId);
      } else {
        setSelectedApartmentId("");
        onApartmentSelect("");
      }
    }
  }, [selectedCityId, selectedApartmentId, onApartmentSelect, includeAllOption]);

  // Handle apartment selection
  const handleApartmentSelect = useCallback((apartmentId: string) => {
    setSelectedApartmentId(apartmentId);
    onApartmentSelect(apartmentId);
  }, [onApartmentSelect]);

  // Get display name for city
  const getCityDisplayName = useCallback((city: { name: string; name_ko?: string; apartmentCount: number }) => {
    const displayName = city.name_ko || city.name;
    return `${displayName} (${city.apartmentCount}개)`;
  }, []);

  // Get display name for apartment
  const getApartmentDisplayName = useCallback((apartment: ApartmentSelectOption) => {
    return apartment.name_ko || apartment.name;
  }, []);

  return {
    selectedCityId,
    selectedApartmentId,
    filteredApartments,
    cityOptionsWithCounts,
    isApartmentSelectorEnabled: selectedCityId !== "",
    handleCitySelect,
    handleApartmentSelect,
    getCityDisplayName,
    getApartmentDisplayName
  };
}