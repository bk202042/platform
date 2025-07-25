"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, MapPin, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocationSearch } from "@/lib/hooks/useVietnameseLocations";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

interface _SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "popular" | "location";
  location?: LocationSearchResult;
}

export function SearchBar({
  onSearch,
  onLocationSelect,
  placeholder = "베트남 지역이나 아파트를 검색하세요...",
  className = "",
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query: _searchQuery,
    setQuery: setSearchQuery,
    results: locationResults,
    isLoading,
  } = useLocationSearch();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("community-search-history");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse search history:", error);
      }
    }
  }, []);

  // Update search query with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        setSearchQuery(query);
      } else {
        setSearchQuery("");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, setSearchQuery]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);
      localStorage.setItem(
        "community-search-history",
        JSON.stringify(newRecentSearches)
      );

      onSearch(searchQuery);
      setIsFocused(false);
      setQuery("");
    }
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setIsFocused(false);
    setQuery("");
  };

  const handleRecentSearchClick = (searchText: string) => {
    setQuery(searchText);
    handleSearch(searchText);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("community-search-history");
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

  const popularSearches = [
    "호치민시",
    "하노이",
    "다낭",
    "빈홈스 센트럴 파크",
    "랜드마크 81",
    "사이공 펄",
    "빈홈스 그랜드 파크",
  ];

  const shouldShowSuggestions = showSuggestions && isFocused;

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 text-base"
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
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {/* Location Results */}
            {query.length >= 2 && (
              <div>
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm">검색 중...</p>
                  </div>
                ) : locationResults.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                      검색 결과
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {locationResults.slice(0, 5).map((location) => (
                        <Button
                          key={location.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    아파트
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {location.full_address_ko ||
                                  location.full_address}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : query.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      최근 검색
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600 h-auto p-1"
                  >
                    전체 삭제
                  </Button>
                </div>
                <div className="py-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {query.length < 2 && (
              <div>
                {recentSearches.length > 0 && <Separator />}
                <div className="px-4 py-2 bg-gray-50 border-b">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">
                      인기 검색어
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  {popularSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-3" />
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
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">베트남 지역이나 아파트를 검색해보세요</p>
                <p className="text-xs text-gray-400 mt-1">
                  호치민시, 하노이, 다낭 등의 도시나 아파트 이름을 입력하세요
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact search bar for mobile or smaller spaces
export function CompactSearchBar({
  onSearch,
  onLocationSelect,
  placeholder = "지역 검색...",
  className = "",
}: Omit<SearchBarProps, "showSuggestions" | "autoFocus">) {
  return (
    <SearchBar
      onSearch={onSearch}
      onLocationSelect={onLocationSelect}
      placeholder={placeholder}
      className={className}
      showSuggestions={false}
      autoFocus={false}
    />
  );
}

// Search bar with modal for mobile
export function ModalSearchBar({
  onSearch,
  onLocationSelect,
  placeholder = "지역 검색",
  className = "",
}: Omit<SearchBarProps, "showSuggestions" | "autoFocus">) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (query: string) => {
    onSearch(query);
    setIsOpen(false);
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full justify-start text-left font-normal text-muted-foreground",
          className
        )}
      >
        <Search className="h-4 w-4 mr-2" />
        {placeholder}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                onLocationSelect={handleLocationSelect}
                placeholder={placeholder}
                showSuggestions={true}
                autoFocus={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
