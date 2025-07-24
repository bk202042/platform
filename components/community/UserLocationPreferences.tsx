"use client";

import { useState } from "react";
import { MapPin, Building2, Star, Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocations } from "@/lib/hooks/useVietnameseLocations";
import { VietnameseLocationSelector } from "./VietnameseLocationSelector";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { toast } from "sonner";

export function UserLocationPreferences() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    locations,
    isLoading,
    error,
    addLocationPreference,
    setPrimaryLocation,
    removeLocationPreference,
  } = useUserLocations();

  const handleAddLocation = async (makePrimary: boolean = false) => {
    if (!selectedLocation) return;

    setIsSubmitting(true);
    try {
      const success = await addLocationPreference(
        selectedLocation.type === "city"
          ? selectedLocation.id
          : selectedLocation.city_name!,
        selectedLocation.type === "apartment" ? selectedLocation.id : undefined,
        makePrimary
      );

      if (success) {
        toast.success("관심 지역이 추가되었습니다.");
        setIsAddDialogOpen(false);
        setSelectedLocation(null);
      }
    } catch (_err) {
      toast.error("관심 지역 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPrimary = async (location: {
    city_id: string;
    apartment_id?: string;
  }) => {
    try {
      const success = await setPrimaryLocation(
        location.city_id,
        location.apartment_id
      );

      if (success) {
        toast.success("주요 지역이 설정되었습니다.");
      }
    } catch (_err) {
      toast.error("주요 지역 설정에 실패했습니다.");
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    try {
      const success = await removeLocationPreference(locationId);

      if (success) {
        toast.success("관심 지역이 제거되었습니다.");
      }
    } catch (_err) {
      toast.error("관심 지역 제거에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>관심 지역</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <Skeleton className="h-4 w-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>관심 지역</span>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>관심 지역 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <VietnameseLocationSelector
                  onLocationSelect={setSelectedLocation}
                  selectedLocation={selectedLocation}
                  placeholder="베트남 도시나 아파트를 검색하세요..."
                />

                {selectedLocation && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedLocation.type === "city" ? (
                        <MapPin className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Building2 className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">
                        {selectedLocation.name_ko || selectedLocation.name}
                      </span>
                      {selectedLocation.type === "apartment" && (
                        <Badge variant="secondary" className="text-xs">
                          아파트
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedLocation.full_address_ko ||
                        selectedLocation.full_address}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAddLocation(false)}
                    disabled={!selectedLocation || isSubmitting}
                    className="flex-1"
                  >
                    관심 지역으로 추가
                  </Button>
                  <Button
                    onClick={() => handleAddLocation(true)}
                    disabled={!selectedLocation || isSubmitting}
                    variant="default"
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    주요 지역으로 설정
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {locations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">아직 관심 지역이 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">
              관심 있는 베트남 지역을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                  location.is_primary
                    ? "border-blue-200 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-shrink-0">
                  {location.apartment_id ? (
                    <Building2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm truncate">
                      {location.apartment_name_ko ||
                        location.apartment_name ||
                        location.city_name_ko ||
                        location.city_name}
                    </span>
                    {location.apartment_id && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        아파트
                      </Badge>
                    )}
                    {location.is_primary && (
                      <Badge
                        variant="default"
                        className="text-xs flex-shrink-0"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        주요
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {location.full_address_ko || location.full_address}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!location.is_primary && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetPrimary(location)}
                      className="h-8 px-2"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLocation(location.id)}
                    className="h-8 px-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for settings or profile pages
export function CompactUserLocationPreferences() {
  const { locations, isLoading } = useUserLocations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  const primaryLocation = locations.find((loc) => loc.is_primary);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">관심 지역</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>관심 지역 관리</DialogTitle>
            </DialogHeader>
            <UserLocationPreferences />
          </DialogContent>
        </Dialog>
      </div>

      {primaryLocation ? (
        <div className="flex items-center space-x-2 text-sm">
          {primaryLocation.apartment_id ? (
            <Building2 className="h-4 w-4 text-green-500" />
          ) : (
            <MapPin className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-gray-600">
            {primaryLocation.full_address_ko || primaryLocation.full_address}
          </span>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          설정된 주요 지역이 없습니다.
        </div>
      )}

      {locations.length > 1 && (
        <div className="text-xs text-gray-400">
          +{locations.length - 1}개 관심 지역
        </div>
      )}
    </div>
  );
}
