"use client";

import { useState } from "react";
import { MapPin, Building2, ChevronDown, Activity, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LocationSearchResult, VietnameseApartment } from "@/lib/data/vietnamese-locations";
import { useAllApartments, useApartmentsWithActivity, useApartmentsByUsers } from "@/lib/hooks/useVietnameseLocations";
import { cn } from "@/lib/utils";

interface QuickLocationSwitcherProps {
  currentLocation?: LocationSearchResult | null;
  onLocationSelect: (location: LocationSearchResult) => void;
  className?: string;
  locations?: LocationSearchResult[];
  isLoading?: boolean;
}

// Component for apartment directory dialog
function ApartmentDirectoryDialog({ 
  onLocationSelect, 
  currentLocation 
}: { 
  onLocationSelect: (location: LocationSearchResult) => void;
  currentLocation?: LocationSearchResult | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "popular">("all");
  const { apartments: allApartments, isLoading: allLoading } = useAllApartments({ limit: 50 });
  const { apartments: activeApartments, isLoading: activeLoading } = useApartmentsWithActivity(20);
  const { apartments: popularApartments, isLoading: popularLoading } = useApartmentsByUsers(20);

  const handleApartmentSelect = (apartment: VietnameseApartment & { cities?: { name: string; name_ko?: string } }) => {
    const locationResult: LocationSearchResult = {
      id: apartment.id,
      type: "apartment",
      name: apartment.name,
      name_ko: apartment.name_ko,
      name_en: apartment.name_en,
      full_address: `${apartment.cities?.name || ""}, ${apartment.district || ""}, ${apartment.name}`.replace(/^,\s*|,\s*$/g, ''),
      full_address_ko: apartment.name_ko ? `${apartment.cities?.name_ko || ""}, ${apartment.district_ko || ""}, ${apartment.name_ko}`.replace(/^,\s*|,\s*$/g, '') : undefined,
      city_name: apartment.cities?.name,
      city_name_ko: apartment.cities?.name_ko,
      district: apartment.district,
      district_ko: apartment.district_ko,
      similarity_score: 1.0,
    };
    onLocationSelect(locationResult);
    setIsOpen(false);
  };

  const ApartmentList = ({ apartments, loading }: { apartments: (VietnameseApartment & { cities?: { name: string; name_ko?: string } })[], loading: boolean }) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (apartments.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>아파트를 찾을 수 없습니다</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {apartments.map((apartment) => {
          const isSelected = currentLocation?.id === apartment.id;
          const apartmentName = apartment.name_ko || apartment.name;
          const cityName = apartment.cities?.name_ko || apartment.cities?.name || "";
          const district = apartment.district_ko || apartment.district || "";
          
          return (
            <button
              key={apartment.id}
              onClick={() => handleApartmentSelect(apartment)}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-colors",
                isSelected
                  ? "bg-orange-50 border-orange-200 text-orange-900"
                  : "hover:bg-zinc-50 border-zinc-200"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                apartment.is_featured 
                  ? "bg-orange-100 text-orange-600" 
                  : "bg-zinc-100 text-zinc-600"
              )}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-zinc-900 truncate">{apartmentName}</h4>
                  {apartment.is_featured && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      추천
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 truncate">
                  {[cityName, district].filter(Boolean).join(", ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-sm font-medium rounded-full border-zinc-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
        >
          <ChevronDown className="h-3 w-3 mr-1" />
          더보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>아파트 선택</DialogTitle>
        </DialogHeader>
        <div className="h-full">
          {/* Tab buttons */}
          <div className="flex space-x-1 bg-zinc-100 p-1 rounded-lg mb-4">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="flex-1 h-8"
            >
              전체
            </Button>
            <Button
              variant={activeTab === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("active")}
              className="flex-1 h-8 flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              활발한 곳
            </Button>
            <Button
              variant={activeTab === "popular" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("popular")}
              className="flex-1 h-8 flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              인기있는 곳
            </Button>
          </div>

          {/* Tab content */}
          {activeTab === "all" && (
            <ApartmentList apartments={allApartments} loading={allLoading} />
          )}
          {activeTab === "active" && (
            <div>
              <div className="mb-3">
                <p className="text-sm text-zinc-600">최근 30일간 게시글이 많은 아파트</p>
              </div>
              <ApartmentList apartments={activeApartments} loading={activeLoading} />
            </div>
          )}
          {activeTab === "popular" && (
            <div>
              <div className="mb-3">
                <p className="text-sm text-zinc-600">가입 사용자가 많은 아파트</p>
              </div>
              <ApartmentList apartments={popularApartments} loading={popularLoading} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickLocationSwitcher({
  currentLocation,
  onLocationSelect,
  className = "",
  locations = [],
  isLoading = false,
}: QuickLocationSwitcherProps) {
  const quickLocations = locations.slice(0, 6); // Show more locations
  const hasMoreLocations = locations.length > 6;

  const handleLocationClick = (location: LocationSearchResult) => {
    onLocationSelect(location);
  };

  if (isLoading) {
    return (
      <div className={cn("px-4 py-3 bg-white border-b border-zinc-200", className)}>
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className={cn("px-4 py-3 bg-white border-b border-zinc-200", className)}>
        <div className="flex items-center justify-end">
          <ApartmentDirectoryDialog 
            onLocationSelect={onLocationSelect}
            currentLocation={currentLocation}
          />
        </div>
      </div>
    );
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
        
        {/* Show More button */}
        {(hasMoreLocations || locations.length > 0) && (
          <ApartmentDirectoryDialog 
            onLocationSelect={onLocationSelect}
            currentLocation={currentLocation}
          />
        )}
      </div>
    </div>
  );
}