"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building } from "lucide-react";

interface Apartment {
  id: string;
  name: string;
  city_id: string;
  cities: { name: string } | null;
}

interface ApartmentSelectorProps {
  apartments: Apartment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ApartmentSelector({ 
  apartments, 
  selectedId, 
  onSelect 
}: ApartmentSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Building size={16} />
        아파트 선택
      </label>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="아파트를 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">전체 아파트</SelectItem>
          {apartments.map(apt => (
            <SelectItem key={apt.id} value={apt.id}>
              {apt.name} - {apt.cities?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}