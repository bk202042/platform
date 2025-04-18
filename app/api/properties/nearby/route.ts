import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET handler for finding properties near a specific location
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse location parameters
    const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
    const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;
    const radiusMeters = searchParams.get('radiusMeters') ? Number(searchParams.get('radiusMeters')) : 5000; // Default 5km
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
    
    // Validate required parameters
    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Validate numeric parameters
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      isNaN(radiusMeters) ||
      isNaN(limit) ||
      isNaN(offset)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid numeric parameter' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Use the get_properties_with_distance function
    const { data, error, count } = await supabase
      .rpc('get_properties_with_distance', {
        lat,
        lng
      })
      .lt('distance_meters', radiusMeters)
      .range(offset, offset + limit - 1)
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
  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch nearby properties', error },
      { status: 500 }
    );
  }
}
