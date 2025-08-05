import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/server-api";

export const runtime = 'nodejs';

/**
 * GET handler for property statistics
 * Returns counts by property type, price ranges, etc.
 */
export async function GET() {
  try {
    const supabase = await createApiClient();

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("property_listings")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Get all property listings (grouping to be done in JS if needed)
    const { data: allProperties, error: allPropertiesError } = await supabase
      .from("property_listings")
      .select("*");

    if (allPropertiesError) throw allPropertiesError;

    // Format price ranges
    const priceRanges = [
      { min: 0, max: 1000, count: 0 },
      { min: 1000, max: 2000, count: 0 },
      { min: 2000, max: 3000, count: 0 },
      { min: 3000, max: 5000, count: 0 },
      { min: 5000, max: 10000, count: 0 },
      { min: 10000, max: null, count: 0 },
    ];

    // Count properties in each price range
    for (const range of priceRanges) {
      const { count, error } = await supabase
        .from("property_listings")
        .select("*", { count: "exact", head: true })
        .gte("price", range.min)
        .lt("price", range.max || 1000000000); // Use a very large number if max is null

      if (error) throw error;
      range.count = count || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        allProperties,
        priceRanges,
      },
    });
  } catch (error) {
    console.error("Error fetching property statistics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch property statistics", error },
      { status: 500 },
    );
  }
}
