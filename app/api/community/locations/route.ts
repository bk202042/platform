import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  searchVietnameseLocations,
  getVietnameseCities,
  getApartmentsByCity,
  getPopularVietnameseLocations,
} from "@/lib/data/vietnamese-locations";

// GET /api/community/locations - Search and get Vietnamese locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") as
      | "city"
      | "apartment"
      | "all"
      | null;
    const cityId = searchParams.get("cityId");
    const popular = searchParams.get("popular") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Return popular locations if requested
    if (popular) {
      const locations = await getPopularVietnameseLocations();
      return NextResponse.json({ locations });
    }

    // Search locations if query provided
    if (query) {
      const locations = await searchVietnameseLocations(
        query,
        type || "all",
        limit
      );
      return NextResponse.json({ locations });
    }

    // Get apartments by city if cityId provided
    if (cityId) {
      const apartments = await getApartmentsByCity(cityId);
      return NextResponse.json({ apartments });
    }

    // Default: return all Vietnamese cities
    const cities = await getVietnameseCities();
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error in locations API:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
