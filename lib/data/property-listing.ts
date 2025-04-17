import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { PropertyType } from '@/types/supabase';

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

export async function getPropertyListings(params: PropertySearchParams = {}) {
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
    const { data, error } = await supabase
      .rpc('search_properties', {
        search_text: searchText || null,
        min_price: minPrice || null,
        max_price: maxPrice || null,
        property_type_filter: propertyType || null,
        min_bedrooms: minBedrooms || null,
        min_bathrooms: minBathrooms || null,
        lat,
        lng,
        radius_meters: radiusMeters || null
      })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Otherwise, use a regular query
  let query = supabase
    .from('property_listings')
    .select('*');

  // Apply filters
  if (searchText) {
    query = query.textSearch('title', searchText, {
      type: 'websearch',
      config: 'english'
    });
  }
  
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (propertyType) query = query.eq('property_type', propertyType);
  if (minBedrooms) query = query.gte('bedrooms', minBedrooms);
  if (minBathrooms) query = query.gte('bathrooms', minBathrooms);

  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Order by created_at by default
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_listings')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
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
