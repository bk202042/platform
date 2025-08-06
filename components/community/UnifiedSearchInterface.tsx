"use client";

import { useState, useEffect } from "react";
import { Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationContextHeader } from "./LocationContextHeader";
import { UnifiedSearchBar } from "./UnifiedSearchBar";
import { QuickLocationSwitcher } from "./QuickLocationSwitcher";
import { usePopularLocations } from "@/lib/hooks/useVietnameseLocations";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

interface UnifiedSearchInterfaceProps {
  initialLocation?: LocationSearchResult | null;
  onLocationChange?: (location: LocationSearchResult | null) => void;
  onContentSearch?: (query: string) => void;
  onCreatePost?: () => void;
  className?: string;
  showCreateButton?: boolean;
  postCount?: number;
  activeUserCount?: number;
}

export function UnifiedSearchInterface({
  initialLocation,
  onLocationChange,
  onContentSearch,
  onCreatePost,
  className = "",
  showCreateButton = true,
  postCount,
  activeUserCount,
}: UnifiedSearchInterfaceProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationSearchResult | null>(
    initialLocation || null
  );
  
  const { locations: popularLocations, isLoading: locationsLoading } = usePopularLocations();

  // Sync with external location changes
  useEffect(() => {
    if (initialLocation !== currentLocation) {
      setCurrentLocation(initialLocation || null);
    }
  }, [initialLocation, currentLocation]);

  const handleLocationSelect = (location: LocationSearchResult) => {
    setCurrentLocation(location);
    onLocationChange?.(location);
  };

  const handleLocationClear = () => {
    setCurrentLocation(null);
    onLocationChange?.(null);
  };

  const handleContentSearch = (query: string) => {
    onContentSearch?.(query);
  };

  const handleCreatePost = () => {
    onCreatePost?.();
  };

  return (
    <div className={cn("bg-white shadow-sm border-b border-zinc-200", className)}>
      {/* Location Context Header */}
      <LocationContextHeader
        currentLocation={currentLocation}
        onClearLocation={handleLocationClear}
        postCount={postCount}
        activeUserCount={activeUserCount}
      />

      {/* Main Search Interface */}
      <div className="px-4 py-3 space-y-3">
        {/* Unified Search Bar */}
        <UnifiedSearchBar
          currentLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          onContentSearch={handleContentSearch}
          showSuggestions={true}
          autoFocus={false}
        />

        {/* Action Buttons */}
        {showCreateButton && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-zinc-600">
              {currentLocation ? (
                <span>
                  <span className="font-medium">{currentLocation.name_ko || currentLocation.name}</span>
                  지역의 커뮤니티
                </span>
              ) : (
                <span>전체 베트남 커뮤니티</span>
              )}
            </div>
            
            <Button
              onClick={handleCreatePost}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 h-9 text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              글쓰기
            </Button>
          </div>
        )}
      </div>

      {/* Quick Location Switcher */}
      <QuickLocationSwitcher
        currentLocation={currentLocation}
        onLocationSelect={handleLocationSelect}
        locations={popularLocations}
        isLoading={locationsLoading}
      />
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function CompactUnifiedSearchInterface({
  initialLocation,
  onLocationChange,
  onContentSearch,
  onCreatePost,
  className = "",
}: Omit<UnifiedSearchInterfaceProps, "showCreateButton" | "postCount" | "activeUserCount">) {
  const [currentLocation, setCurrentLocation] = useState<LocationSearchResult | null>(
    initialLocation || null
  );
  
  const { locations: popularLocations, isLoading: locationsLoading } = usePopularLocations();

  useEffect(() => {
    if (initialLocation !== currentLocation) {
      setCurrentLocation(initialLocation || null);
    }
  }, [initialLocation, currentLocation]);

  const handleLocationSelect = (location: LocationSearchResult) => {
    setCurrentLocation(location);
    onLocationChange?.(location);
  };

  const _handleLocationClear = () => {
    setCurrentLocation(null);
    onLocationChange?.(null);
  };

  const handleContentSearch = (query: string) => {
    onContentSearch?.(query);
  };

  return (
    <div className={cn("bg-white shadow-sm border-b border-zinc-200", className)}>
      {/* Compact Location Context */}
      <div className="px-3 py-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {currentLocation ? (
              <>
                {currentLocation.type === "city" ? (
                  <div className="h-3 w-3 rounded-full bg-orange-500 flex-shrink-0" />
                ) : (
                  <div className="h-3 w-3 rounded bg-orange-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-zinc-900 truncate">
                  {currentLocation.name_ko || currentLocation.name}
                </span>
              </>
            ) : (
              <>
                <div className="h-3 w-3 rounded-full bg-zinc-400 flex-shrink-0" />
                <span className="text-sm font-medium text-zinc-500">전체 지역</span>
              </>
            )}
          </div>
          
          {onCreatePost && (
            <Button
              onClick={onCreatePost}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-3 text-xs rounded-md ml-2 flex-shrink-0"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              글쓰기
            </Button>
          )}
        </div>
      </div>

      {/* Compact Search */}
      <div className="px-3 py-2.5">
        <UnifiedSearchBar
          currentLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          onContentSearch={handleContentSearch}
          showSuggestions={true}
          autoFocus={false}
          className="text-sm"
        />
      </div>

      {/* Quick Locations */}
      <div className="px-3 py-2 border-t border-zinc-100">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-hide">
          {locationsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-14 bg-zinc-200 rounded-full flex-shrink-0 animate-pulse" />
            ))
          ) : (
            popularLocations.slice(0, 6).map((location) => {
              const isSelected = currentLocation?.id === location.id;
              return (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 transition-colors whitespace-nowrap",
                    isSelected
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {location.name_ko || location.name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}