"use client";

import { useState, useEffect } from "react";
import { MapPin, Building2, Star, Search, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useLocationSearch,
  usePopularLocations,
  useUserLocations,
} from "@/lib/hooks/useVietnameseLocations";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

// Client-side location formatting function
function formatLocationDisplay(
  cityName: string,
  cityNameKo?: string,
  district?: string,
  districtKo?: string,
  apartmentName?: string,
  apartmentNameKo?: string,
  useKorean: boolean = true
): string {
  if (useKorean && cityNameKo) {
    const parts = [cityNameKo];
    if (districtKo) parts.push(districtKo);
    if (apartmentNameKo) parts.push(apartmentNameKo);
    return parts.join(", ");
  } else {
    const parts = [cityName];
    if (district) parts.push(district);
    if (apartmentName) parts.push(apartmentName);
    return parts.join(", ");
  }
}

interface LocationSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: LocationSearchResult | null) => void;
  selectedLocation?: LocationSearchResult | null;
  title?: string;
}

export function LocationSelectorModal({
  open,
  onOpenChange,
  onLocationSelect,
  selectedLocation,
  title = "지역 변경",
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "popular" | "user">(
    "popular"
  );

  const {
    query: _query,
    setQuery,
    results: searchResults,
    isLoading: searchLoading,
  } = useLocationSearch();

  const { locations: popularLocations, isLoading: popularLoading } =
    usePopularLocations();

  const { locations: userLocations, isLoading: userLoading } =
    useUserLocations();

  // Update search query when input changes
  useEffect(() => {
    setQuery(searchQuery);
    if (searchQuery.length > 0) {
      setActiveTab("search");
    }
  }, [searchQuery, setQuery]);

  const handleLocationSelect = (location: LocationSearchResult | null) => {
    onLocationSelect(location);
    onOpenChange(false);
    setSearchQuery("");
    setActiveTab("popular");
  };

  const handleClearLocation = () => {
    handleLocationSelect(null);
  };

  const renderLocationItem = (
    location: LocationSearchResult,
    showFullAddress = true
  ) => (
    <Button
      key={location.id}
      variant="ghost"
      className="w-full justify-start h-auto p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
      onClick={() => handleLocationSelect(location)}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className="flex-shrink-0">
          {location.type === "city" ? (
            <MapPin className="h-5 w-5 text-blue-500" />
          ) : (
            <Building2 className="h-5 w-5 text-green-500" />
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-base">
              {location.name_ko || location.name}
            </span>
            {location.type === "apartment" && (
              <Badge variant="secondary" className="text-xs">
                아파트
              </Badge>
            )}
            {selectedLocation?.id === location.id && (
              <Badge variant="default" className="text-xs">
                선택됨
              </Badge>
            )}
          </div>
          {showFullAddress && (
            <div className="text-sm text-gray-500 mt-1">
              {location.full_address_ko || location.full_address}
            </div>
          )}
          {location.name !== (location.name_ko || location.name) && (
            <div className="text-xs text-gray-400 mt-1">{location.name}</div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </Button>
  );

  const renderUserLocationSection = () => {
    if (userLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (userLocations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">설정된 관심 지역이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">
            관심 있는 베트남 지역을 검색해서 추가해보세요.
          </p>
        </div>
      );
    }

    // Convert user locations to LocationSearchResult format
    const userLocationResults: LocationSearchResult[] = userLocations.map(
      (loc) => ({
        id: loc.apartment_id || loc.city_id,
        type: loc.apartment_id ? "apartment" : "city",
        name: loc.apartment_name || loc.city_name,
        name_ko: loc.apartment_name_ko || loc.city_name_ko,
        full_address: loc.full_address,
        full_address_ko: loc.full_address_ko,
        city_name: loc.city_name,
        city_name_ko: loc.city_name_ko,
        district: loc.district,
        district_ko: loc.district_ko,
        similarity_score: loc.is_primary ? 1.0 : 0.9,
      })
    );

    // Sort by primary first, then alphabetically
    const sortedUserLocations = userLocationResults.sort((a, b) => {
      const aIsPrimary = userLocations.find(
        (loc) => (loc.apartment_id || loc.city_id) === a.id
      )?.is_primary;
      const bIsPrimary = userLocations.find(
        (loc) => (loc.apartment_id || loc.city_id) === b.id
      )?.is_primary;

      if (aIsPrimary && !bIsPrimary) return -1;
      if (!aIsPrimary && bIsPrimary) return 1;
      return (a.name_ko || a.name).localeCompare(b.name_ko || b.name);
    });

    return (
      <div className="space-y-0">
        {sortedUserLocations.map((location) => {
          const userLocation = userLocations.find(
            (loc) => (loc.apartment_id || loc.city_id) === location.id
          );
          return (
            <div key={location.id} className="relative">
              {renderLocationItem(location)}
              {userLocation?.is_primary && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPopularLocations = () => {
    if (popularLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (popularLocations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">인기 지역을 불러올 수 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {popularLocations.map((location) => renderLocationItem(location))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (searchQuery && searchResults.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            &ldquo;{searchQuery}&rdquo;에 대한 검색 결과가 없습니다.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            다른 키워드로 검색해보세요.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {searchResults.map((location) => renderLocationItem(location))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="베트남 도시나 아파트를 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-white"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 py-3 border-b bg-white">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("popular")}
                className="text-sm"
              >
                인기 지역
              </Button>
              <Button
                variant={activeTab === "user" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("user")}
                className="text-sm"
              >
                관심 지역 위치 사용하기
              </Button>
            </div>
          </div>

          {/* Clear Selection Option */}
          {selectedLocation && (
            <div className="px-6 py-2 border-b bg-blue-50">
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={handleClearLocation}
              >
                <X className="h-4 w-4 mr-2" />
                선택된 지역 해제
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery
              ? renderSearchResults()
              : activeTab === "user"
                ? renderUserLocationSection()
                : renderPopularLocations()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Location selector button component for triggering the modal
interface LocationSelectorButtonProps {
  selectedLocation?: LocationSearchResult | null;
  onOpenModal: () => void;
  className?: string;
  placeholder?: string;
}

export function LocationSelectorButton({
  selectedLocation,
  onOpenModal,
  className = "",
  placeholder = "지역을 선택하세요",
}: LocationSelectorButtonProps) {
  const displayText = selectedLocation
    ? formatLocationDisplay(
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
      )
    : placeholder;

  return (
    <Button
      variant="outline"
      onClick={onOpenModal}
      className={cn(
        "w-full justify-between text-left font-normal h-10 px-4 py-2 rounded-lg border border-zinc-300 hover:border-orange-400 hover:bg-orange-50 transition-colors",
        selectedLocation 
          ? "text-zinc-900 bg-white border-orange-300" 
          : "text-zinc-500 bg-white",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {selectedLocation ? (
          selectedLocation.type === "city" ? (
            <MapPin className="h-4 w-4 text-orange-500" />
          ) : (
            <Building2 className="h-4 w-4 text-orange-500" />
          )
        ) : (
          <MapPin className="h-4 w-4 text-zinc-400" />
        )}
        <span className="truncate font-medium">
          {selectedLocation ? (
            <span className="text-zinc-900">{displayText}</span>
          ) : (
            <span className="text-zinc-500">{displayText}</span>
          )}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
    </Button>
  );
}
