"use client";

import { X, MapPin, Building2, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

interface LocationContextHeaderProps {
  currentLocation?: LocationSearchResult | null;
  onClearLocation: () => void;
  postCount?: number;
  activeUserCount?: number;
  className?: string;
}

export function LocationContextHeader({
  currentLocation,
  onClearLocation,
  postCount,
  activeUserCount,
  className,
}: LocationContextHeaderProps) {
  if (!currentLocation) {
    return (
      <div className={cn("px-4 py-3 bg-zinc-50 border-b border-zinc-200", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-500">
              전체 베트남 지역
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-zinc-400">
            {postCount !== undefined && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{postCount.toLocaleString()}개 게시글</span>
              </div>
            )}
            {activeUserCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{activeUserCount.toLocaleString()}명 활동</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const locationName = currentLocation.name_ko || currentLocation.name;
  const fullAddress = currentLocation.full_address_ko || currentLocation.full_address;
  
  // Extract district and city information for hierarchical display
  const parts = fullAddress.split(", ");
  const displayParts = parts.length > 1 ? parts.slice(0, 2) : [locationName];

  return (
    <div className={cn("px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Location Icon */}
          <div className="flex-shrink-0">
            {currentLocation.type === "city" ? (
              <MapPin className="h-5 w-5 text-orange-600" />
            ) : (
              <Building2 className="h-5 w-5 text-orange-600" />
            )}
          </div>

          {/* Location Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-zinc-900 truncate">
                {displayParts.join(", ")}
              </span>
              {currentLocation.type === "apartment" && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-0">
                  아파트
                </Badge>
              )}
            </div>
            {parts.length > 2 && (
              <div className="text-xs text-zinc-600 truncate mt-0.5">
                {parts.slice(2).join(", ")}
              </div>
            )}
          </div>

          {/* Community Activity Indicators */}
          <div className="flex items-center space-x-4 text-xs text-zinc-600">
            {postCount !== undefined && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium">{postCount.toLocaleString()}</span>
              </div>
            )}
            {activeUserCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span className="font-medium">{activeUserCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Clear Location Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearLocation}
          className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-orange-100 rounded-full ml-2 flex-shrink-0"
          title="지역 선택 해제"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function CompactLocationContextHeader({
  currentLocation,
  onClearLocation,
  className,
}: Omit<LocationContextHeaderProps, "postCount" | "activeUserCount">) {
  if (!currentLocation) {
    return (
      <div className={cn("px-3 py-2 bg-zinc-50 border-b border-zinc-200", className)}>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-500">전체 지역</span>
        </div>
      </div>
    );
  }

  const locationName = currentLocation.name_ko || currentLocation.name;

  return (
    <div className={cn("px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {currentLocation.type === "city" ? (
            <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
          ) : (
            <Building2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-zinc-900 truncate">
            {locationName}
          </span>
          {currentLocation.type === "apartment" && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-0">
              아파트
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearLocation}
          className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-orange-100 rounded-full ml-2 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}