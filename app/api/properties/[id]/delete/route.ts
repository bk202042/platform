import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById, deleteProperty } from '@/lib/data/property';

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

    // Check if property exists
    const existingProperty = await getPropertyById(id);

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete property using the data access layer
    await deleteProperty(id);

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
