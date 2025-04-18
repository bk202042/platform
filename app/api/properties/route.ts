import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PropertyType } from '@/types/property';

/**
 * GET handler for property listings
 * Supports various search and filter parameters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse search parameters
    const searchText = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const propertyType = searchParams.get('propertyType') as PropertyType | undefined;
    const minBedrooms = searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined;
    const minBathrooms = searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined;
    const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
    const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;
    const radiusMeters = searchParams.get('radiusMeters') ? Number(searchParams.get('radiusMeters')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
    
    // Validate numeric parameters
    if (
      (minPrice !== undefined && isNaN(minPrice)) ||
      (maxPrice !== undefined && isNaN(maxPrice)) ||
      (minBedrooms !== undefined && isNaN(minBedrooms)) ||
      (minBathrooms !== undefined && isNaN(minBathrooms)) ||
      (lat !== undefined && isNaN(lat)) ||
      (lng !== undefined && isNaN(lng)) ||
      (radiusMeters !== undefined && isNaN(radiusMeters)) ||
      isNaN(limit) ||
      isNaN(offset)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid numeric parameter' },
        { status: 400 }
      );
    }
    
    // Validate property type
    if (propertyType && !['월세', '매매'].includes(propertyType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property type' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
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
      
      return NextResponse.json({
        success: true,
        data,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      });
    }
    
    // Otherwise, use a regular query
    let query = supabase
      .from('property_listings')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (searchText) {
      query = query.or(`title.ilike.%${searchText}%,description.ilike.%${searchText}%`);
    }
    
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    
    if (minBedrooms !== undefined) {
      query = query.gte('bedrooms', minBedrooms);
    }
    
    if (minBathrooms !== undefined) {
      query = query.gte('bathrooms', minBathrooms);
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch properties', error },
      { status: 500 }
    );
  }
}
