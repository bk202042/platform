import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * DELETE handler for removing a property
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    
    // Delete property
    const { error } = await supabase
      .from('property_listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete property', error },
      { status: 500 }
    );
  }
}
