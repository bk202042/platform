import { NextRequest, NextResponse } from "next/server";
import { getPropertyListings, PropertySearchParams } from "@/lib/data/property";
import { PropertyType } from "@/lib/types/property";

/**
 * GET handler for property listings
 * Supports various search and filter parameters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse search parameters
    const searchText = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;
    const propertyType = searchParams.get("propertyType") as
      | PropertyType
      | undefined;
    const minBedrooms = searchParams.get("minBedrooms")
      ? Number(searchParams.get("minBedrooms"))
      : undefined;
    const minBathrooms = searchParams.get("minBathrooms")
      ? Number(searchParams.get("minBathrooms"))
      : undefined;
    const lat = searchParams.get("lat")
      ? Number(searchParams.get("lat"))
      : undefined;
    const lng = searchParams.get("lng")
      ? Number(searchParams.get("lng"))
      : undefined;
    const radiusMeters = searchParams.get("radiusMeters")
      ? Number(searchParams.get("radiusMeters"))
      : undefined;
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 10;
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 0;

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
        { success: false, message: "Invalid numeric parameter" },
        { status: 400 },
      );
    }

    // Validate property type
    if (propertyType && !["월세", "매매"].includes(propertyType)) {
      return NextResponse.json(
        { success: false, message: "Invalid property type" },
        { status: 400 },
      );
    }

    // Use the data access layer to get property listings
    const params: PropertySearchParams = {
      searchText,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      minBathrooms,
      lat,
      lng,
      radiusMeters,
      limit,
      offset,
    };

    const result = await getPropertyListings(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch properties", error },
      { status: 500 },
    );
  }
}
