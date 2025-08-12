"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { 
  Root as PopoverRoot, 
  Trigger as PopoverTrigger, 
  Portal as PopoverPortal, 
  Content as PopoverContentPrimitive 
} from '@radix-ui/react-popover';
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


  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);
  
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


  // Defensive check for data availability to prevent race conditions
  const isDataReady = allApartments.length > 0 && cities.length > 0;

  return (
    <PopoverRoot open={open && isDataReady} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open && isDataReady}
          className={cn("w-full justify-between", className)}
          onClick={() => isDataReady && setOpen(!open)}
          disabled={!isDataReady}
        >
          <span className={cn(
            selectedApartment && selectedCity ? "text-foreground" : "text-muted-foreground"
          )}>
            {!isDataReady 
              ? "🔄 아파트 정보를 불러오는 중..."
              : selectedApartment && selectedCity 
              ? `${selectedCity.name}, ${selectedApartment.name}` 
              : "🏢 아파트를 검색하고 선택하세요"
            }
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContentPrimitive
          className={cn(
            "w-[--radix-popover-trigger-width] p-0",
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-popover-content-transform-origin) rounded-md border shadow-md outline-hidden"
          )}
          side="bottom" 
          align="start"
          sideOffset={4}
          avoidCollisions={true}
          onOpenAutoFocus={(e) => {
            // Prevent auto focus issues in dialog
            e.preventDefault();
          }}
        >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="아파트 이름 검색..."
            value={searchQuery}
            onValueChange={handleSearchChange}
            autoFocus={false}
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
                    onSelect={(_currentValue) => {
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
                      // Reset search after selection
                      setSearchQuery('');
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
        </PopoverContentPrimitive>
      </PopoverPortal>
    </PopoverRoot>
  );
}
