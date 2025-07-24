import { NextResponse } from "next/server";
import {
  searchVietnameseLocations,
  getVietnameseCities,
  getApartmentsByCity,
  getPopularVietnameseLocations,
} from "@/lib/data/vietnamese-locations";

export async function GET() {
  try {
    console.log("Testing Vietnamese location functions...");

    // Test 1: Get all Vietnamese cities
    console.log("\n1. Testing getVietnameseCities...");
    const cities = await getVietnameseCities();
    console.log(`Found ${cities.length} Vietnamese cities`);
    console.log(
      "Sample cities:",
      cities
        .slice(0, 3)
        .map((c) => ({
          name: c.name,
          name_ko: c.name_ko,
          is_major: c.is_major_city,
        }))
    );

    // Test 2: Search locations
    console.log("\n2. Testing searchVietnameseLocations...");
    const searchResults = await searchVietnameseLocations("호치민", "all", 5);
    console.log(`Search for '호치민' returned ${searchResults.length} results`);
    console.log(
      "Search results:",
      searchResults.map((r) => ({
        type: r.type,
        name: r.name,
        name_ko: r.name_ko,
        full_address: r.full_address,
        similarity: r.similarity_score,
      }))
    );

    // Test 3: Get apartments by city (Ho Chi Minh City)
    console.log("\n3. Testing getApartmentsByCity...");
    const hoChiMinhCity = cities.find((c) => c.name.includes("Ho Chi Minh"));
    if (hoChiMinhCity) {
      const apartments = await getApartmentsByCity(hoChiMinhCity.id);
      console.log(`Found ${apartments.length} apartments in Ho Chi Minh City`);
      console.log(
        "Sample apartments:",
        apartments.slice(0, 3).map((a) => ({
          name: a.name,
          name_ko: a.name_ko,
          district: a.district,
          is_featured: a.is_featured,
        }))
      );
    }

    // Test 4: Get popular locations
    console.log("\n4. Testing getPopularVietnameseLocations...");
    const popularLocations = await getPopularVietnameseLocations();
    console.log(`Found ${popularLocations.length} popular locations`);
    console.log(
      "Popular locations:",
      popularLocations.slice(0, 5).map((l) => ({
        type: l.type,
        name: l.name,
        name_ko: l.name_ko,
        full_address: l.full_address_ko || l.full_address,
      }))
    );

    // Test 5: Search with different queries
    console.log("\n5. Testing various search queries...");
    const testQueries = ["다낭", "Vinhomes", "District 1", "하노이"];

    for (const query of testQueries) {
      const results = await searchVietnameseLocations(query, "all", 3);
      console.log(`Search '${query}': ${results.length} results`);
      if (results.length > 0) {
        console.log("  Top result:", {
          type: results[0].type,
          name: results[0].name,
          name_ko: results[0].name_ko,
          similarity: results[0].similarity_score,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Vietnamese location functions tested successfully",
      results: {
        cities_count: cities.length,
        search_results_count: searchResults.length,
        apartments_count: hoChiMinhCity
          ? (await getApartmentsByCity(hoChiMinhCity.id)).length
          : 0,
        popular_locations_count: popularLocations.length,
      },
    });
  } catch (error) {
    console.error("Error testing Vietnamese location functions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
