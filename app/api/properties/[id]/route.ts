import { NextRequest, NextResponse } from "next/server";
import { getPropertyById, updateProperty } from "@/lib/data/property";

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
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid property ID format" },
        { status: 400 },
      );
    }

    // Use the data access layer to get property by ID
    const data = await getPropertyById(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch property", error },
      { status: 500 },
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
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid property ID format" },
        { status: 400 },
      );
    }

    // Parse request body
    const updates = await request.json();

    // Validate updates
    const allowedFields = [
      "title",
      "description",
      "price",
      "property_type",
      "bedrooms",
      "bathrooms",
      "square_footage",
      "location",
      "address",
      "features",
    ];

    // Filter out any fields that are not allowed to be updated
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = updates[key];
          return obj;
        },
        {} as Record<string, any>,
      );

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Check if property exists
    const existingProperty = await getPropertyById(id);

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 },
      );
    }

    // Use the data access layer to update the property
    const data = await updateProperty(id, filteredUpdates);

    return NextResponse.json({
      success: true,
      data,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update property", error },
      { status: 500 },
    );
  }
}
