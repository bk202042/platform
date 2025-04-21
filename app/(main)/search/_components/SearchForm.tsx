"use client";

import { useState, useTransition } from "react";
import { PropertyType } from "@/types/property";
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
  const [, startTransition] = useTransition(); // Remove isPending

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
      newErrors.minPrice = "Must be a valid number";
    }

    if (maxPrice && isNaN(Number(maxPrice))) {
      newErrors.maxPrice = "Must be a valid number";
    }

    if (minBedrooms && isNaN(Number(minBedrooms))) {
      newErrors.minBedrooms = "Must be a valid number";
    }

    if (minBathrooms && isNaN(Number(minBathrooms))) {
      newErrors.minBathrooms = "Must be a valid number";
    }

    if ((lat && !lng) || (!lat && lng)) {
      newErrors.location = "Both latitude and longitude are required";
    }

    if (lat && isNaN(Number(lat))) {
      newErrors.lat = "Must be a valid number";
    }

    if (lng && isNaN(Number(lng))) {
      newErrors.lng = "Must be a valid number";
    }

    if (radiusMeters && isNaN(Number(radiusMeters))) {
      newErrors.radiusMeters = "Must be a valid number";
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Find Your Property</CardTitle>
        <CardDescription>
          Search for properties in Vietnam that match your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Text */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search
            </label>
            <Input
              id="search"
              placeholder="Enter keywords..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label htmlFor="propertyType" className="text-sm font-medium">
              Property Type
            </label>
            <Select
              value={propertyType}
              onValueChange={(value) => setPropertyType(value as PropertyType)}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="월세">Monthly Rent (월세)</SelectItem>
                <SelectItem value="매매">Purchase (매매)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minPrice" className="text-sm font-medium">
                Min Price (USD)
              </label>
              <Input
                id="minPrice"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={errors.minPrice ? "border-red-500" : ""}
              />
              {errors.minPrice && (
                <p className="text-xs text-red-500">{errors.minPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="maxPrice" className="text-sm font-medium">
                Max Price (USD)
              </label>
              <Input
                id="maxPrice"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={errors.maxPrice ? "border-red-500" : ""}
              />
              {errors.maxPrice && (
                <p className="text-xs text-red-500">{errors.maxPrice}</p>
              )}
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minBedrooms" className="text-sm font-medium">
                Min Bedrooms
              </label>
              <Input
                id="minBedrooms"
                placeholder="Min bedrooms"
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className={errors.minBedrooms ? "border-red-500" : ""}
              />
              {errors.minBedrooms && (
                <p className="text-xs text-red-500">{errors.minBedrooms}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="minBathrooms" className="text-sm font-medium">
                Min Bathrooms
              </label>
              <Input
                id="minBathrooms"
                placeholder="Min bathrooms"
                value={minBathrooms}
                onChange={(e) => setMinBathrooms(e.target.value)}
                className={errors.minBathrooms ? "border-red-500" : ""}
              />
              {errors.minBathrooms && (
                <p className="text-xs text-red-500">{errors.minBathrooms}</p>
              )}
            </div>
          </div>

          {/* Location Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="lat"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className={
                    errors.lat || errors.location ? "border-red-500" : ""
                  }
                />
                {errors.lat && (
                  <p className="text-xs text-red-500">{errors.lat}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  id="lng"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className={
                    errors.lng || errors.location ? "border-red-500" : ""
                  }
                />
                {errors.lng && (
                  <p className="text-xs text-red-500">{errors.lng}</p>
                )}
              </div>
            </div>
            {errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <label className="text-sm font-medium block mb-2">Features</label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.keys(features).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${key}`}
                    checked={features[key]}
                    onCheckedChange={(checked) => {
                      setFeatures((prev) => ({
                        ...prev,
                        [key]: Boolean(checked),
                      }));
                    }}
                  />
                  <Label
                    htmlFor={`feature-${key}`}
                    className="text-sm font-normal capitalize"
                  >
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <label htmlFor="radiusMeters" className="text-sm font-medium">
              Search Radius (meters)
            </label>
            <Input
              id="radiusMeters"
              placeholder="Radius in meters"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
              className={errors.radiusMeters ? "border-red-500" : ""}
            />
            {errors.radiusMeters && (
              <p className="text-xs text-red-500">{errors.radiusMeters}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleSubmit}>Search</Button>
      </CardFooter>
    </Card>
  );
}
