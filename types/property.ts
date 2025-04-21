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
 * Property listing interface that matches the database schema
 * Based on the columns in the property_listings table
 * Designed for Vietnamese properties targeting Korean expatriates
 */
export interface PropertyListing {
  id?: string;
  title: string;
  description: string;
  price: number; // In USD
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  location: string; // PostGIS format: 'POINT(longitude latitude)'
  address: string;
  features: PropertyFeatures;
  created_at?: string;
  updated_at?: string;
  created_by?: string; // User ID of creator
  images: PropertyImage[];
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

  // Additional features as key-value pairs
  [key: string]: any;
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

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_text: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
