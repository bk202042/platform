import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePropertyListing } from '@/lib/validation/property';

/**
 * POST handler for creating a new property
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const propertyData = await request.json();
    
    // Validate property data
    const validation = validatePropertyListing(propertyData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid property data', errors: validation.errors },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Insert property
    const { data, error } = await supabase
      .from('property_listings')
      .insert(propertyData)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Property created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create property', error },
      { status: 500 }
    );
  }
}
