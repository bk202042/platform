"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';


// Component-specific interfaces that extend database types
export interface ApartmentSelectOption {
  id: string;
  name: string;
  name_ko?: string;
  city_id: string;
  district?: string;
  district_ko?: string;
}

export interface CitySelectOption {
  id: string;
  name: string;
  name_ko?: string;
}

interface ApartmentAutocompleteProps {
  onApartmentSelect: (apartmentId: string) => void;
  value: string;
  className?: string;
  cities: CitySelectOption[];
  apartments: ApartmentSelectOption[];
}

export function ApartmentAutocomplete({
  onApartmentSelect,
  value,
  className,
  cities,
  apartments: allApartments,
}: ApartmentAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered apartments with enhanced search
  const filteredApartments = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allApartments.slice(0, 20); // Limit initial results for performance
    }
    
    const query = debouncedSearchQuery.toLowerCase().trim();
    
    return allApartments
      .filter(apartment => {
        // Search in apartment name (Korean and English)
        const nameMatch = apartment.name.toLowerCase().includes(query) ||
                          (apartment.name_ko && apartment.name_ko.toLowerCase().includes(query));
        
        // Search in district (Korean and English)
        const districtMatch = (apartment.district && apartment.district.toLowerCase().includes(query)) ||
                             (apartment.district_ko && apartment.district_ko.toLowerCase().includes(query));
        
        // Search in city name
        const city = cities.find(c => c.id === apartment.city_id);
        const cityMatch = city && (
          city.name.toLowerCase().includes(query) ||
          (city.name_ko && city.name_ko.toLowerCase().includes(query))
        );
        
        return nameMatch || districtMatch || cityMatch;
      })
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameExact = a.name.toLowerCase() === query || 
                          (a.name_ko && a.name_ko.toLowerCase() === query);
        const bNameExact = b.name.toLowerCase() === query ||
                          (b.name_ko && b.name_ko.toLowerCase() === query);
        
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;
        
        // Then prioritize name starts with query
        const aNameStarts = a.name.toLowerCase().startsWith(query) ||
                           (a.name_ko && a.name_ko.toLowerCase().startsWith(query));
        const bNameStarts = b.name.toLowerCase().startsWith(query) ||
                           (b.name_ko && b.name_ko.toLowerCase().startsWith(query));
        
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;
        
        // Finally sort alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, 50); // Limit search results for performance
  }, [allApartments, cities, debouncedSearchQuery]);

  const selectedApartment = useMemo(() => 
    allApartments.find(apt => apt.id === value), 
    [allApartments, value]
  );
  
  const selectedCity = useMemo(() => 
    selectedApartment ? cities.find(city => city.id === selectedApartment.city_id) : null,
    [selectedApartment, cities]
  );

  const handleSearchChange = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(!open)}
        >
          <span className={cn(
            selectedApartment && selectedCity ? "text-foreground" : "text-muted-foreground"
          )}>
            {selectedApartment && selectedCity 
              ? `${selectedCity.name}, ${selectedApartment.name}` 
              : "🏢 아파트를 검색하고 선택하세요"
            }
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="아파트 이름 검색..."
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {debouncedSearchQuery ? `"${debouncedSearchQuery}"에 대한 검색 결과가 없습니다.` : "아파트를 검색해보세요."}
            </CommandEmpty>
            <CommandGroup>
              {filteredApartments.map((apartment) => {
                const city = cities.find(c => c.id === apartment.city_id);
                return (
                  <CommandItem
                    key={apartment.id}
                    value={apartment.id}
                    onSelect={() => {
                      // CRITICAL FIX: Use apartment.id directly instead of currentValue
                      // Radix UI Command converts currentValue to lowercase, breaking UUID validation
                      // Since apartment.id comes from our database, no validation needed
                      try {
                        onApartmentSelect(apartment.id);
                        console.log('Apartment selected successfully:', apartment.name, apartment.id);
                      } catch (error) {
                        console.error('Failed to select apartment:', apartment.name, error);
                        // Could add toast notification here for user feedback
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === apartment.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city?.name}, {apartment.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
