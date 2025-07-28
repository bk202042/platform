"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, MapPin, Building2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocationSearch } from "@/lib/hooks/useVietnameseLocations";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

interface UnifiedSearchBarProps {
  currentLocation?: LocationSearchResult | null;
  onLocationSelect: (location: LocationSearchResult) => void;
  onContentSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function UnifiedSearchBar({
  currentLocation,
  onLocationSelect,
  onContentSearch,
  placeholder,
  className = "",
  showSuggestions = true,
  autoFocus = false,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchType, setSearchType] = useState<"location" | "content">("content");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query: _locationQuery,
    setQuery: setLocationQuery,
    results: locationResults,
    isLoading: locationLoading,
  } = useLocationSearch();

  // Dynamic placeholder based on current context
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    if (currentLocation) {
      const locationName = currentLocation.name_ko || currentLocation.name;
      return `${locationName}에서 검색...`;
    }
    
    return "지역 선택 또는 게시글 검색...";
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("unified-search-history");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse search history:", error);
      }
    }
  }, []);

  // Auto-detect search type based on query
  useEffect(() => {
    const trimmedQuery = query.trim();
    
    // Check if query contains Vietnamese location keywords
    const locationKeywords = ['호치민', '하노이', '다낭', '빈홈스', '랜드마크', '사이공', '아파트', '구', '시', '동'];
    const isLocationQuery = locationKeywords.some(keyword => 
      trimmedQuery.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // If we have a current location, prefer content search unless explicitly location-related
    if (currentLocation && !isLocationQuery && trimmedQuery.length > 0) {
      setSearchType("content");
    } else if (trimmedQuery.length >= 2) {
      setSearchType(isLocationQuery ? "location" : "content");
    }
  }, [query, currentLocation]);

  // Update location search query with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchType === "location" && query.length >= 2) {
        setLocationQuery(query);
      } else {
        setLocationQuery("");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchType, setLocationQuery]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleSearch = (searchQuery: string, type: "location" | "content" = searchType) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem("unified-search-history", JSON.stringify(newRecentSearches));

    if (type === "content") {
      onContentSearch(searchQuery);
    }
    
    setIsFocused(false);
    setQuery("");
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    onLocationSelect(location);
    setIsFocused(false);
    setQuery("");
  };

  const handleRecentSearchClick = (searchText: string) => {
    setQuery(searchText);
    handleSearch(searchText, "content");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Popular content searches based on current location context
  const getPopularSearches = () => {
    if (currentLocation) {
      return [
        "맛집 추천",
        "부동산 정보",
        "교통 정보",
        "생활 정보",
        "한국 음식점",
        "병원 정보",
        "쇼핑몰",
      ];
    }
    
    return [
      "호치민시",
      "하노이",
      "다낭",
      "빈홈스 센트럴 파크",
      "랜드마크 81",
      "맛집 추천",
      "부동산 정보",
    ];
  };

  const shouldShowSuggestions = showSuggestions && isFocused;

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={getPlaceholder()}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-10 h-12 text-base transition-all duration-200",
            currentLocation
              ? "border-orange-300 focus:border-orange-500 focus:ring-orange-200"
              : "border-zinc-300 focus:border-blue-500 focus:ring-blue-200"
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {shouldShowSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden shadow-lg border-0 shadow-xl shadow-zinc-200/50">
          <CardContent className="p-0">
            {/* Search Type Indicator */}
            {query.length >= 2 && (
              <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100">
                <div className="flex items-center space-x-2">
                  {searchType === "location" ? (
                    <>
                      <MapPin className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium text-zinc-600">지역 검색</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-3 w-3 text-orange-500" />
                      <span className="text-xs font-medium text-zinc-600">
                        {currentLocation ? "이 지역에서 게시글 검색" : "게시글 검색"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Location Results */}
            {searchType === "location" && query.length >= 2 && (
              <div>
                {locationLoading ? (
                  <div className="p-4 text-center text-zinc-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm">검색 중...</p>
                  </div>
                ) : locationResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {locationResults.slice(0, 5).map((location) => (
                      <Button
                        key={location.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-blue-50 border-b border-zinc-100 last:border-b-0"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex-shrink-0">
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
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {location.full_address_ko || location.full_address}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-zinc-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                    <p className="text-sm">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* Content Search - Recent Searches */}
            {(searchType === "content" || query.length < 2) && recentSearches.length > 0 && (
              <div>
                {query.length >= 2 && <Separator />}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-500">최근 검색</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("unified-search-history");
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 h-auto p-1"
                  >
                    전체 삭제
                  </Button>
                </div>
                <div className="py-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm hover:bg-orange-50"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <Clock className="h-4 w-4 text-zinc-400 mr-3" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {(searchType === "content" || query.length < 2) && (
              <div>
                {(recentSearches.length > 0 || query.length >= 2) && <Separator />}
                <div className="px-4 py-2 bg-zinc-50 border-b">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-500">
                      {currentLocation ? "이 지역 인기 검색어" : "인기 검색어"}
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  {getPopularSearches().map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm hover:bg-orange-50"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <TrendingUp className="h-4 w-4 text-zinc-400 mr-3" />
                      {search}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {index + 1}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query.length < 2 && recentSearches.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                <p className="text-sm">
                  {currentLocation
                    ? "이 지역에서 관심 있는 주제를 검색해보세요"
                    : "베트남 지역을 선택하거나 게시글을 검색해보세요"
                  }
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {currentLocation
                    ? "맛집, 부동산, 생활 정보 등을 검색할 수 있습니다"
                    : "호치민시, 하노이, 다낭 등의 지역이나 관심 주제를 입력하세요"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact version for mobile
export function CompactUnifiedSearchBar({
  currentLocation,
  onLocationSelect,
  onContentSearch,
  className = "",
}: Omit<UnifiedSearchBarProps, "placeholder" | "showSuggestions" | "autoFocus">) {
  return (
    <UnifiedSearchBar
      currentLocation={currentLocation}
      onLocationSelect={onLocationSelect}
      onContentSearch={onContentSearch}
      className={className}
      showSuggestions={false}
      autoFocus={false}
    />
  );
}