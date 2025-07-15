'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Apartment {
  id: string;
  name: string;
  cities: { name: string } | null;
}

interface ApartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApartmentSelect({ value, onChange }: ApartmentSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [apartments, setApartments] = React.useState<Apartment[]>([]);

  React.useEffect(() => {
    async function loadApartments() {
      try {
        const response = await fetch('/api/community/apartments');
        if (!response.ok) {
          throw new Error('Failed to fetch apartments');
        }
        const data = await response.json();
        setApartments(data);
      } catch (error) {
        console.error('Failed to load apartments:', error);
      }
    }
    loadApartments();
  }, []);

  const selectedApartment = apartments.find((apt) => apt.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedApartment
            ? `${selectedApartment.cities?.name} - ${selectedApartment.name}`
            : 'Select apartment...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search apartment..." />
          <CommandEmpty>No apartment found.</CommandEmpty>
          <CommandGroup>
            {apartments.map((apartment) => (
              <CommandItem
                key={apartment.id}
                value={apartment.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === apartment.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {apartment.cities?.name} - {apartment.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
