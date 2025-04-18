import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET handler for retrieving a single property by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('property_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        return NextResponse.json(
          { success: false, message: 'Property not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch property', error },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a property
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = [
      'title', 'description', 'price', 'property_type', 
      'bedrooms', 'bathrooms', 'square_footage', 
      'location', 'address', 'features'
    ];
    
    // Filter out any fields that are not allowed to be updated
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as Record<string, any>);
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Check if property exists
    const { data: existingProperty, error: checkError } = await supabase
      .from('property_listings')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Property not found' },
          { status: 404 }
        );
      }
      throw checkError;
    }
    
    // Update property
    const { data, error } = await supabase
      .from('property_listings')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update property', error },
      { status: 500 }
    );
  }
}
