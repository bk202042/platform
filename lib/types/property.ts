/**
 * Property types available in the Vietnamese market for Korean expatriates
 * Note: No '전세' (jeonse/lease) option as this system doesn't exist in Vietnam
 */
export type PropertyType = "월세" | "매매"; // Monthly rent or Purchase

/**
 * Vietnamese cities with significant Korean expatriate populations
 */
export type VietnamCity =
  | "Ho Chi Minh City"
  | "Hanoi"
  | "Da Nang"
  | "Nha Trang"
  | "Vung Tau"
  | "Hai Phong";

/**
 * Represents a single image associated with a property, matching the DB schema.
 * Includes a dynamically added field for the public URL after processing.
 */
export interface PropertyImage {
  id: string;
  property_id: string;
  url?: string | null; // Original URL column from schema (might be unused)
  storage_path: string; // Path/key in Supabase Storage bucket (Confirmed from schema)
  alt_text: string | null;
  display_order?: number; // Use schema column name
  is_primary?: boolean; // Use schema column name
  created_at: string;
  updated_at: string;
  created_by: string | null;
  publicUrl?: string | null; // Dynamically added field for processed URL
}

/**
 * Property listing interface that matches the database schema
 * Based on the columns in the property_listings table
 * Designed for Vietnamese properties targeting Korean expatriates
 */
export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PropertyListing {
  id?: string;
  title: string;
  description: string;
  price: number; // In USD
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  location: GeoJSONPoint; // Type for PostGIS location data might need refinement
  address: string;
  features: PropertyFeatures; // Consider defining this more strictly if possible
  created_at?: string;
  updated_at?: string;
  created_by?: string; // User ID of creator
  // This field holds the image data fetched from the DB, potentially processed later
  property_images?: PropertyImage[]; // Use the correct field name matching the DB relation
  // This field will be added dynamically after processing images
  primary_image?: string | null;
}

/**
 * Features available in Vietnamese properties
 * Includes standard amenities and features specifically relevant to Korean expatriates
 */
export interface PropertyFeatures {
  // Standard amenities
  parking?: boolean;
  airConditioning?: boolean;
  elevator?: boolean;
  balcony?: boolean;
  security?: boolean;
  pool?: boolean;
  gym?: boolean;
  furnished?: boolean;

  // Korean expatriate specific features
  koreanCommunity?: boolean; // Proximity to Korean community
  koreanRestaurants?: boolean; // Proximity to Korean restaurants
  internationalSchool?: boolean; // Proximity to international schools
  koreanSchool?: boolean; // Proximity to Korean schools
  koreanSupermarket?: boolean; // Proximity to Korean supermarkets

  // Allow other potential features, but avoid 'any' if possible
  [key: string]: boolean | undefined; // Changed 'any' to 'boolean | undefined'
}

/**
 * Search parameters for property listings
 */
export interface PropertySearchParams {
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  minBedrooms?: number;
  minBathrooms?: number;
  city?: VietnamCity;
  district?: string;
  features?: Partial<PropertyFeatures>;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  limit?: number;
  offset?: number;
}

/**
 * Validation result for property listings
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
