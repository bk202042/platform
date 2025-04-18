import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { PropertyType } from '@/types/supabase';
import { unstable_cache } from 'next/cache';

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
  data: any[];
  total: number;
  hasMore: boolean;
}

// Cache the property listings for 1 minute
const getCachedPropertyListings = unstable_cache(
  async (params: PropertySearchParams = {}): Promise<PropertySearchResult> => {
    const supabase = await createClient();
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
      offset = 0
    } = params;

    // If we have location parameters, use the search_properties function
    if (lat !== undefined && lng !== undefined) {
      const { data, error, count } = await supabase
        .rpc('search_properties', {
          search_text: searchText || null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          property_type_filter: propertyType || null,
          min_bedrooms: minBedrooms || null,
          min_bathrooms: minBathrooms || null,
          lat,
          lng,
          radius_meters: radiusMeters || 5000 // Default 5km radius
        })
        .range(offset, offset + limit - 1)
        .order('distance_meters', { ascending: true })
        .select('*', { count: 'exact' });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    }

    // Otherwise, use a regular query
    let query = supabase
      .from('property_listings')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchText) {
      query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%`);
    }

    if (minPrice !== undefined) query = query.gte('price', minPrice);
    if (maxPrice !== undefined) query = query.lte('price', maxPrice);
    if (propertyType) query = query.eq('property_type', propertyType);
    if (minBedrooms !== undefined) query = query.gte('bedrooms', minBedrooms);
    if (minBathrooms !== undefined) query = query.gte('bathrooms', minBathrooms);

    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  },
  ['property-listings'],
  { revalidate: 60 } // Cache for 1 minute
);

// Public function that uses the cached version
export async function getPropertyListings(params: PropertySearchParams = {}): Promise<PropertySearchResult> {
  return getCachedPropertyListings(params);
}

// Cache property details for 5 minutes
const getCachedPropertyById = unstable_cache(
  async (id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  },
  ['property-by-id'],
  { revalidate: 300 } // Cache for 5 minutes
);

// Public function that uses the cached version
export async function getPropertyById(id: string) {
  return getCachedPropertyById(id);
}

export async function createProperty(property: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_listings')
    .insert(property)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(id: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('property_listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
