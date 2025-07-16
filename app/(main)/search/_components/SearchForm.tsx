"use client";

import { useState, useTransition } from "react";
import { PropertyType } from "@/lib/types/property";
import { usePropertyData } from "@/components/providers/PropertyDataProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Label } from "@/components/ui/label"; // Import Label

interface SearchFormProps {
  className?: string;
  onSearch?: (searchParams: Record<string, string>) => void;
}

export default function SearchForm({ className, onSearch }: SearchFormProps) {
  const { searchParams, updateSearchParams, resetSearchParams } =
    usePropertyData();
  const [, startTransition] = useTransition();

  // Initialize form state from URL search params
  const [searchText, setSearchText] = useState(searchParams.search || "");
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || "");
  const [propertyType, setPropertyType] = useState<PropertyType | "any">(
    (searchParams.propertyType as PropertyType) || "any",
  );
  const [minBedrooms, setMinBedrooms] = useState(
    searchParams.minBedrooms || "",
  );
  const [minBathrooms, setMinBathrooms] = useState(
    searchParams.minBathrooms || "",
  );
  const [lat, setLat] = useState(searchParams.lat || "");
  const [lng, setLng] = useState(searchParams.lng || "");
  const [radiusMeters, setRadiusMeters] = useState(
    searchParams.radiusMeters || "5000",
  );
  // Add state for features
  const [features, setFeatures] = useState<Record<string, boolean>>({
    parking: searchParams.parking === "true",
    pool: searchParams.pool === "true",
    gym: searchParams.gym === "true",
    furnished: searchParams.furnished === "true",
  });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate numeric fields
    if (minPrice && isNaN(Number(minPrice))) {
      newErrors.minPrice = "유효한 숫자여야 합니다";
    }

    if (maxPrice && isNaN(Number(maxPrice))) {
      newErrors.maxPrice = "유효한 숫자여야 합니다";
    }

    if (minBedrooms && isNaN(Number(minBedrooms))) {
      newErrors.minBedrooms = "유효한 숫자여야 합니다";
    }

    if (minBathrooms && isNaN(Number(minBathrooms))) {
      newErrors.minBathrooms = "유효한 숫자여야 합니다";
    }

    if ((lat && !lng) || (!lat && lng)) {
      newErrors.location = "위도와 경도 모두 필요합니다";
    }

    if (lat && isNaN(Number(lat))) {
      newErrors.lat = "유효한 숫자여야 합니다";
    }

    if (lng && isNaN(Number(lng))) {
      newErrors.lng = "유효한 숫자여야 합니다";
    }

    if (radiusMeters && isNaN(Number(radiusMeters))) {
      newErrors.radiusMeters = "유효한 숫자여야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build search params
    const params: Record<string, string> = {};

    if (searchText) params.search = searchText;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (propertyType && propertyType !== "any")
      params.propertyType = propertyType;
    if (minBedrooms) params.minBedrooms = minBedrooms;
    if (minBathrooms) params.minBathrooms = minBathrooms;
    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
      params.radiusMeters = radiusMeters;
    }
    // Add features to params if true
    Object.entries(features).forEach(([key, value]) => {
      if (value) {
        params[key] = "true";
      }
    });

    // If onSearch prop is provided, call it with the search params
    if (onSearch) {
      onSearch(params);
    } else {
      // Otherwise, update the search params using the provider
      startTransition(() => {
        updateSearchParams(params);
      });
    }
  };

  const handleReset = () => {
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("any");
    setMinBedrooms("");
    setMinBathrooms("");
    setLat("");
    setLng("");
    setRadiusMeters("5000");
    // Reset features state
    setFeatures({
      parking: false,
      pool: false,
      gym: false,
      furnished: false,
    });
    setErrors({});

    // Reset search params in the URL
    startTransition(() => {
      resetSearchParams();
    });
  };

  return (
    <Card className={`${className} border-gray-200 rounded-xl shadow-none`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">매물 찾기</CardTitle>
        <CardDescription>조건에 맞는 베트남 매물 검색</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Search Text */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              검색
            </label>
            <Input
              id="search"
              placeholder="키워드 입력..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label htmlFor="propertyType" className="text-sm font-medium">
              매물 유형
            </label>
            <Select
              value={propertyType}
              onValueChange={(value) =>
                setPropertyType(value as PropertyType | "any")
              }
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="매물 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">모든 매물 유형</SelectItem>
                <SelectItem value="월세">월세</SelectItem>
                <SelectItem value="매매">매매</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <label htmlFor="minPrice" className="text-sm font-medium">
              최소 가격
            </label>
            <Input
              id="minPrice"
              placeholder="예: 50000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            {errors.minPrice && (
              <p className="text-red-500 text-xs">{errors.minPrice}</p>
            )}
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <label htmlFor="maxPrice" className="text-sm font-medium">
              최대 가격
            </label>
            <Input
              id="maxPrice"
              placeholder="예: 100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            {errors.maxPrice && (
              <p className="text-red-500 text-xs">{errors.maxPrice}</p>
            )}
          </div>

          {/* Min Bedrooms */}
          <div className="space-y-2">
            <label htmlFor="minBedrooms" className="text-sm font-medium">
              최소 침실 수
            </label>
            <Input
              id="minBedrooms"
              placeholder="예: 2"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
            />
            {errors.minBedrooms && (
              <p className="text-red-500 text-xs">{errors.minBedrooms}</p>
            )}
          </div>

          {/* Min Bathrooms */}
          <div className="space-y-2">
            <label htmlFor="minBathrooms" className="text-sm font-medium">
              최소 욕실 수
            </label>
            <Input
              id="minBathrooms"
              placeholder="예: 1"
              value={minBathrooms}
              onChange={(e) => setMinBathrooms(e.target.value)}
            />
            {errors.minBathrooms && (
              <p className="text-red-500 text-xs">{errors.minBathrooms}</p>
            )}
          </div>

          {/* Location (Latitude) */}
          <div className="space-y-2">
            <label htmlFor="lat" className="text-sm font-medium">
              위치 (위도)
            </label>
            <Input
              id="lat"
              placeholder="예: 10.7769"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            {errors.lat && <p className="text-red-500 text-xs">{errors.lat}</p>}
          </div>

          {/* Location (Longitude) */}
          <div className="space-y-2">
            <label htmlFor="lng" className="text-sm font-medium">
              위치 (경도)
            </label>
            <Input
              id="lng"
              placeholder="예: 106.7009"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
            {errors.lng && <p className="text-red-500 text-xs">{errors.lng}</p>}
          </div>
          {errors.location && (
            <p className="text-red-500 text-xs">{errors.location}</p>
          )}

          {/* Radius (meters) */}
          <div className="space-y-2">
            <label htmlFor="radiusMeters" className="text-sm font-medium">
              반경 (미터)
            </label>
            <Input
              id="radiusMeters"
              placeholder="예: 5000"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
            />
            {errors.radiusMeters && (
              <p className="text-red-500 text-xs">{errors.radiusMeters}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="text-sm font-medium">시설</label>
            <div className="space-y-2 pt-1">
              {(Object.keys(features) as Array<keyof typeof features>).map(
                (featureKey) => (
                  <div key={featureKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={featureKey}
                      checked={features[featureKey]}
                      onCheckedChange={(checked) =>
                        setFeatures((prev) => ({
                          ...prev,
                          [featureKey]: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor={featureKey} className="font-normal">
                      {featureKey === "parking"
                        ? "주차"
                        : featureKey === "pool"
                          ? "수영장"
                          : featureKey === "gym"
                            ? "헬스장"
                            : featureKey === "furnished"
                              ? "가구 포함"
                              : featureKey}
                    </Label>
                  </div>
                ),
              )}
            </div>
          </div>

          <CardFooter className="flex flex-col sm:flex-row justify-between p-0 pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="submit" className="w-full sm:w-auto">
              필터 적용
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              필터 초기화
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
