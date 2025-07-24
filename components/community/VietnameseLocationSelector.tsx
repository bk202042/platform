"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Building2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLocationSearch,
  usePopularLocations,
} from "@/lib/hooks/useVietnameseLocations";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { formatLocationDisplay } from "@/lib/data/vietnamese-locations";

interface VietnameseLocationSelectorProps {
  onLocationSelect: (location: LocationSearchResult) => void;
  selectedLocation?: LocationSearchResult | null;
  placeholder?: string;
  showPopular?: boolean;
  className?: string;
}

export function VietnameseLocationSelector({
  onLocationSelect,
  selectedLocation,
  placeholder = "베트남 도시나 아파트를 검색하세요...",
  showPopular = true,
  className = "",
}: VietnameseLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const {
    query,
    setQuery,
    results,
    isLoading: searchLoading,
    error: searchError,
  } = useLocationSearch();

  const { locations: popularLocations, isLoading: popularLoading } =
    usePopularLocations();

  // Update input value when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      const displayText = formatLocationDisplay(
        selectedLocation.city_name || selectedLocation.name,
        selectedLocation.city_name_ko || selectedLocation.name_ko,
        selectedLocation.district,
        selectedLocation.district_ko,
        selectedLocation.type === "apartment"
          ? selectedLocation.name
          : undefined,
        selectedLocation.type === "apartment"
          ? selectedLocation.name_ko
          : undefined,
        true
      );
      setInputValue(displayText);
    } else {
      setInputValue("");
    }
  }, [selectedLocation]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setQuery(value);
    setIsOpen(true);
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setIsOpen(false);
    setQuery("");
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on results
    setTimeout(() => setIsOpen(false), 200);
  };

  const displayResults = query ? results : showPopular ? popularLocations : [];
  const isLoading = query ? searchLoading : popularLoading;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchError ? (
              <div className="p-4 text-center text-red-500">
                검색 중 오류가 발생했습니다.
              </div>
            ) : displayResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {query ? "검색 결과가 없습니다." : "인기 지역을 불러오는 중..."}
              </div>
            ) : (
              <div className="space-y-1">
                {!query && showPopular && (
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">
                    인기 지역
                  </div>
                )}
                {displayResults.map((location) => (
                  <Button
                    key={location.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2 hover:bg-gray-50"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        {location.type === "city" ? (
                          <MapPin className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {location.name_ko || location.name}
                          </span>
                          {location.type === "apartment" && (
                            <Badge variant="secondary" className="text-xs">
                              아파트
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {location.full_address_ko || location.full_address}
                        </div>
                        {location.name !==
                          (location.name_ko || location.name) && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {location.name}
                          </div>
                        )}
                      </div>
                      {query && location.similarity_score > 0.8 && (
                        <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact version for forms
export function CompactLocationSelector({
  onLocationSelect,
  selectedLocation,
  placeholder = "지역 선택",
  className = "",
}: Omit<VietnameseLocationSelectorProps, "showPopular">) {
  return (
    <VietnameseLocationSelector
      onLocationSelect={onLocationSelect}
      selectedLocation={selectedLocation}
      placeholder={placeholder}
      showPopular={false}
      className={className}
    />
  );
}

// Location display component
export function LocationDisplay({
  location,
  showType = true,
  className = "",
}: {
  location: LocationSearchResult;
  showType?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {location.type === "city" ? (
        <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
      ) : (
        <Building2 className="h-4 w-4 text-green-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm truncate">
            {location.name_ko || location.name}
          </span>
          {showType && location.type === "apartment" && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              아파트
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {location.full_address_ko || location.full_address}
        </div>
      </div>
    </div>
  );
}
