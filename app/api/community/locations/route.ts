import { NextRequest, NextResponse } from "next/server";
import {
  searchVietnameseLocations,
  getVietnameseCities,
  getApartmentsByCity,
  getPopularVietnameseLocations,
  getApartmentsWithRecentActivity,
  getApartmentsByUserCount,
  getAllVietnameseApartments,
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
    const withActivity = searchParams.get("withActivity") === "true";
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") as "activity" | "users" | "name" | null;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    // Get apartments with specific sorting/filtering
    if (sortBy === "activity") {
      const apartments = await getApartmentsWithRecentActivity(limit);
      return NextResponse.json({ apartments });
    }

    if (sortBy === "users") {
      const apartments = await getApartmentsByUserCount(limit);
      return NextResponse.json({ apartments });
    }

    // Get apartments by city if cityId provided
    if (cityId) {
      const apartments = await getApartmentsByCity(cityId);
      return NextResponse.json({ apartments });
    }

    // Get all apartments with comprehensive filtering
    if (type === "apartment" || searchParams.has("all")) {
      const apartments = await getAllVietnameseApartments({
        featured: featured ? featured === "true" : undefined,
        withActivity,
        limit,
        offset,
      });
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
