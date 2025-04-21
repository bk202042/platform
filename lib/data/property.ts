import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAnonClient } from "@/lib/supabase/server-anon";
import { PropertyListing, PropertyType } from "@/types/property";
import { unstable_cache } from "next/cache";
import { PostgrestError } from '@supabase/supabase-js';

interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_text: string | null;
  order: number;
  created_at: string;
  created_by: string;
}

export interface PropertySearchParams {
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  minBedrooms?: number;
  minBathrooms?: number;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  limit?: number;
  offset?: number;
}

export interface PropertySearchResult {
  data: PropertyListing[];
  total: number;
  hasMore: boolean;
}

// Cache the property listings for 1 minute
const getCachedPropertyListings = unstable_cache(
  async (params: PropertySearchParams = {}): Promise<PropertySearchResult> => {
    const supabase = await createAnonClient();
    // Rest of the function remains the same
    const {
      searchText,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      minBathrooms,
      lat,
      lng,
      radiusMeters,
      limit = 10,
      offset = 0,
    } = params;

    // If we have location parameters, use the search_properties function
    if (lat !== undefined && lng !== undefined) {
      const { data, error, count } = await supabase
        .rpc("search_properties", {
          search_text: searchText || null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          property_type_filter: propertyType || null,
          min_bedrooms: minBedrooms || null,
          min_bathrooms: minBathrooms || null,
          lat,
          lng,
          radius_meters: radiusMeters || 5000, // Default 5km radius
        })
        .range(offset, offset + limit - 1)
        .order("distance_meters", { ascending: true })
        .select("*", { count: "exact" });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    }

    // Otherwise, use a regular query
    let query = supabase
      .from("property_listings")
      .select("*", { count: "exact" });

    // Apply filters
    if (searchText) {
      query = query.or(
        `title.ilike.%${searchText}%,description.ilike.%${searchText}%`,
      );
    }

    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);
    if (propertyType) query = query.eq("property_type", propertyType);
    if (minBedrooms !== undefined) query = query.gte("bedrooms", minBedrooms);
    if (minBathrooms !== undefined)
      query = query.gte("bathrooms", minBathrooms);

    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  },
  ["property-listings"],
  { revalidate: 60 }, // Cache for 1 minute
);

// Public function that uses the cached version
export async function getPropertyListings(
  params: PropertySearchParams = {},
): Promise<PropertySearchResult> {
  return getCachedPropertyListings(params);
}

// Cache property details for 5 minutes
const getCachedPropertyById = unstable_cache(
  async (id: string): Promise<PropertyListing | null> => {
    const supabase = await createAnonClient();
    const { data, error } = await supabase
      .from("property_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  },
  ["property-by-id"],
  { revalidate: 300 }, // Cache for 5 minutes
);

// Public function to get property by ID
export async function getPropertyById(id: string): Promise<PropertyListing | null> {
  return getCachedPropertyById(id);
}

// Get similar properties based on property type, price range, and location
export async function getSimilarProperties(property: PropertyListing, limit = 3): Promise<PropertyListing[]> {
  const supabase = await createAnonClient();

  // Don't include the current property
  let query = supabase
    .from("property_listings")
    .select("*")
    .neq("id", property.id)
    .eq("property_type", property.property_type);

  // Price range: +/- 30%
  const minPrice = property.price * 0.7;
  const maxPrice = property.price * 1.3;
  query = query.gte("price", minPrice).lte("price", maxPrice);

  // If we have bedrooms, try to match similar properties
  if (property.bedrooms) {
    query = query.or(
      `bedrooms.eq.${property.bedrooms},bedrooms.eq.${property.bedrooms - 1},bedrooms.eq.${property.bedrooms + 1}`,
    );
  }

  // Limit results
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createProperty(property: Omit<PropertyListing, 'id' | 'created_at'>): Promise<PropertyListing> {
  const supabase = await createClient(); // Keep using authenticated client for write operations
  const { data, error } = await supabase
    .from("property_listings")
    .insert(property)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(id: string, updates: Partial<PropertyListing>): Promise<PropertyListing> {
  const supabase = await createClient(); // Keep using authenticated client for write operations
  const { data, error } = await supabase
    .from("property_listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const supabase = await createClient(); // Keep using authenticated client for write operations
  const { error } = await supabase
    .from("property_listings")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  const supabase = await createAnonClient();
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('order');

  if (error) {
    console.error('Error fetching property images:', error);
    return [];
  }

  return data;
}

export async function addPropertyImage(propertyId: string, imageData: Omit<PropertyImage, 'id' | 'created_at'>): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  return await supabase
    .from('property_images')
    .insert(imageData)
    .select()
    .single();
}

export async function updatePropertyImageOrder(imageId: string, newOrder: number): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  return await supabase
    .from('property_images')
    .update({ order: newOrder })
    .eq('id', imageId)
    .select()
    .single();
}

export async function deletePropertyImage(imageId: string): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  return await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)
    .select()
    .single();
}
