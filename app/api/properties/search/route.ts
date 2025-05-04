import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/server-api";

/**
 * POST handler for advanced property search
 * Supports searching by features and other complex criteria
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const searchCriteria = await request.json();

    // Extract search parameters
    const {
      searchText,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      minBathrooms,
      features,
      lat,
      lng,
      radiusMeters,
      limit = 10,
      offset = 0,
    } = searchCriteria;

    // Validate property type
    if (propertyType && !["월세", "매매"].includes(propertyType)) {
      return NextResponse.json(
        { success: false, message: "Invalid property type" },
        { status: 400 },
      );
    }

    const supabase = await createApiClient();

    // Start building the query
    let query = supabase
      .from("property_listings")
      .select("*", { count: "exact" });

    // Apply basic filters
    if (searchText) {
      query = query.or(
        `title.ilike.%${searchText}%,description.ilike.%${searchText}%`,
      );
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    if (propertyType) {
      query = query.eq("property_type", propertyType);
    }

    if (minBedrooms !== undefined) {
      query = query.gte("bedrooms", minBedrooms);
    }

    if (minBathrooms !== undefined) {
      query = query.gte("bathrooms", minBathrooms);
    }

    // Apply feature filters
    if (features && Object.keys(features).length > 0) {
      // For each feature, add a containment check
      Object.entries(features).forEach(([feature, value]) => {
        if (value === true) {
          // Check if the feature exists and is true
          query = query.contains("features", { [feature]: true });
        }
      });
    }

    // If location parameters are provided, we need to use a different approach
    // since we can't easily combine the RPC function with other filters
    if (lat !== undefined && lng !== undefined) {
      // First, get all properties that match our filters
      const { data: filteredProperties, error: filterError } = await query;

      if (filterError) throw filterError;

      if (!filteredProperties || filteredProperties.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        });
      }

      // Get the IDs of the filtered properties
      const propertyIds = filteredProperties.map((p) => p.id);

      // Now use the search_properties function to get properties with distance
      const { data, error, count } = await supabase
        .rpc("search_properties", {
          search_text: null, // We've already filtered by search text
          min_price: null, // We've already filtered by price
          max_price: null,
          property_type_filter: null, // We've already filtered by property type
          min_bedrooms: null, // We've already filtered by bedrooms
          min_bathrooms: null, // We've already filtered by bathrooms
          lat,
          lng,
          radius_meters: radiusMeters || 5000, // Default 5km radius
        })
        .in("id", propertyIds) // Only include properties that matched our filters
        .range(offset, offset + limit - 1)
        .order("distance_meters", { ascending: true });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      });
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search properties", error },
      { status: 500 },
    );
  }
}
