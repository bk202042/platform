"use client";

import React, { useState } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface City {
  id: string;
  name: string;
}

interface Apartment {
  id: string;
  name: string;
  city_id: string;
}

interface ApartmentAutocompleteProps {
  onApartmentSelect: (apartmentId: string) => void;
  value: string;
  className?: string;
  cities: City[];
  apartments: Apartment[];
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

  const filteredApartments = allApartments.filter(apartment =>
    apartment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedApartment = allApartments.find(apt => apt.id === value);
  const selectedCity = selectedApartment ? cities.find(city => city.id === selectedApartment.city_id) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedApartment && selectedCity ? `${selectedCity.name}, ${selectedApartment.name}` : "아파트를 선택하세요..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="아파트 이름 검색..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>결과 없음.</CommandEmpty>
            <CommandGroup>
              {filteredApartments.map((apartment) => {
                const city = cities.find(c => c.id === apartment.city_id);
                return (
                  <CommandItem
                    key={apartment.id}
                    value={`${city?.name}, ${apartment.name}`}
                    onSelect={() => {
                      onApartmentSelect(apartment.id);
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
