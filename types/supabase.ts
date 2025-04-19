import { PropertyType } from './property';

export interface PropertyListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  square_footage: number | null;
  location: any; // Geography type
  address: string;
  features: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      property_listings: {
        Row: PropertyListing;
        Insert: Omit<PropertyListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PropertyListing, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      find_properties_within_radius: (lat: number, lng: number, radius_meters: number) => PropertyListing[];
      get_properties_with_distance: (lat: number, lng: number) => (PropertyListing & { distance_meters: number })[];
      search_properties: (
        search_text?: string | null,
        min_price?: number | null,
        max_price?: number | null,
        property_type_filter?: PropertyType | null,
        min_bedrooms?: number | null,
        min_bathrooms?: number | null,
        lat?: number | null,
        lng?: number | null,
        radius_meters?: number | null
      ) => (PropertyListing & { distance_meters: number | null })[];
    };
  };
}
