import { createClient } from "../supabase/server";

// Types for Vietnamese location system
export interface VietnameseCity {
  id: string;
  name: string;
  name_ko?: string;
  name_en?: string;
  country: string;
  timezone: string;
  is_major_city: boolean;
}

export interface VietnameseApartment {
  id: string;
  name: string;
  name_ko?: string;
  name_en?: string;
  district?: string;
  district_ko?: string;
  address?: string;
  address_ko?: string;
  city_id: string;
  latitude?: number;
  longitude?: number;
  is_featured: boolean;
}

// Extended interface for apartment data with joined city information
interface ApartmentWithCity extends VietnameseApartment {
  cities: { name: string; name_ko?: string; country: string } | { name: string; name_ko?: string; country: string }[];
}

// Interface for processed apartment data in getPopularVietnameseLocations
interface ProcessedApartment {
  id: string;
  name: string;
  name_ko?: string;
  name_en?: string;
  district?: string;
  district_ko?: string;
  cities: { name: string; name_ko?: string; country: string };
  priority: number;
}

export interface LocationSearchResult {
  id: string;
  type: "city" | "apartment";
  name: string;
  name_ko?: string;
  name_en?: string;
  full_address: string;
  full_address_ko?: string;
  city_name?: string;
  city_name_ko?: string;
  district?: string;
  district_ko?: string;
  similarity_score: number;
}

export interface UserLocation {
  id: string;
  city_id: string;
  apartment_id?: string;
  is_primary: boolean;
  city_name: string;
  city_name_ko?: string;
  apartment_name?: string;
  apartment_name_ko?: string;
  district?: string;
  district_ko?: string;
  full_address: string;
  full_address_ko?: string;
}

export interface LocationBasedPost {
  post_id: string;
  title?: string;
  body: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  apartment_id: string;
  apartment_name: string;
  apartment_name_ko?: string;
  city_name: string;
  city_name_ko?: string;
  district?: string;
  district_ko?: string;
  is_user_location: boolean;
}

/**
 * Search Vietnamese locations with fuzzy matching
 * Supports searching cities and apartments with Korean and English names
 */
export async function searchVietnameseLocations(
  query: string,
  type: "city" | "apartment" | "all" = "all",
  limit: number = 10
): Promise<LocationSearchResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_vietnamese_locations", {
    search_query: query,
    search_type: type,
    limit_count: limit,
  });

  if (error) {
    console.error("Error searching Vietnamese locations:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get all Vietnamese cities with Korean localization
 */
export async function getVietnameseCities(): Promise<VietnameseCity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("country", "Vietnam")
    .order("is_major_city", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching Vietnamese cities:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get apartments by city with Vietnamese formatting
 */
export async function getApartmentsByCity(
  cityId: string
): Promise<VietnameseApartment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_apartments_by_city", {
    city_uuid: cityId,
  });

  if (error) {
    console.error("Error fetching apartments by city:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get user's preferred Vietnamese locations
 */
export async function getUserPreferredLocations(
  userId: string
): Promise<UserLocation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_preferred_locations", {
    user_uuid: userId,
  });

  if (error) {
    console.error("Error fetching user preferred locations:", error);
    throw error;
  }

  return data || [];
}

/**
 * Set user's primary location
 */
export async function setUserPrimaryLocation(
  userId: string,
  cityId: string,
  apartmentId?: string
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_user_primary_location", {
    user_uuid: userId,
    city_uuid: cityId,
    apartment_uuid: apartmentId || null,
  });

  if (error) {
    console.error("Error setting user primary location:", error);
    throw error;
  }

  return data;
}

/**
 * Add user location preference
 */
export async function addUserLocationPreference(
  userId: string,
  cityId: string,
  apartmentId?: string,
  makePrimary: boolean = false
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("add_user_location_preference", {
    user_uuid: userId,
    city_uuid: cityId,
    apartment_uuid: apartmentId || null,
    make_primary: makePrimary,
  });

  if (error) {
    console.error("Error adding user location preference:", error);
    throw error;
  }

  return data;
}

/**
 * Remove user location preference
 */
export async function removeUserLocationPreference(
  userId: string,
  locationId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_locations")
    .delete()
    .eq("id", locationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing user location preference:", error);
    throw error;
  }
}

/**
 * Get posts based on user's location preferences
 */
export async function getPostsByUserLocations(
  userId: string,
  category?: string,
  sort: "latest" | "popular" = "latest",
  limit: number = 20,
  offset: number = 0
): Promise<LocationBasedPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_posts_by_user_locations", {
    user_uuid: userId,
    category_filter: category || null,
    sort_option: sort,
    limit_count: limit,
    offset_count: offset,
  });

  if (error) {
    console.error("Error fetching posts by user locations:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get location autocomplete suggestions for Vietnamese addresses
 * Formats results in "Ho Chi Minh City, District 1, Vinhomes Central Park" format
 */
export async function getLocationAutocompleteSuggestions(
  query: string,
  limit: number = 5
): Promise<LocationSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Search both cities and apartments
    const results = await searchVietnameseLocations(query, "all", limit);

    // Sort by similarity score and prioritize exact matches
    return results
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact =
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          (a.name_ko && a.name_ko.toLowerCase().includes(query.toLowerCase()));
        const bExact =
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          (b.name_ko && b.name_ko.toLowerCase().includes(query.toLowerCase()));

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then sort by similarity score
        return b.similarity_score - a.similarity_score;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting location autocomplete suggestions:", error);
    return [];
  }
}

/**
 * Format location for display in Korean style
 */
export function formatLocationDisplay(
  cityName: string,
  cityNameKo?: string,
  district?: string,
  districtKo?: string,
  apartmentName?: string,
  apartmentNameKo?: string,
  useKorean: boolean = true
): string {
  if (useKorean && cityNameKo) {
    const parts = [cityNameKo];
    if (districtKo) parts.push(districtKo);
    if (apartmentNameKo) parts.push(apartmentNameKo);
    return parts.join(", ");
  } else {
    const parts = [cityName];
    if (district) parts.push(district);
    if (apartmentName) parts.push(apartmentName);
    return parts.join(", ");
  }
}

/**
 * Get apartments with recent community activity (last 30 days)
 */
export async function getApartmentsWithRecentActivity(
  limit: number = 20
): Promise<VietnameseApartment[]> {
  const supabase = await createClient();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activeApartments, error } = await supabase
      .from("community_posts")
      .select(
        `
        apartment_id,
        apartments!inner(
          id, name, name_ko, name_en, district, district_ko, address, address_ko,
          city_id, latitude, longitude, is_featured
        )
      `
      )
      .eq("is_deleted", false)
      .eq("status", "published")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .limit(limit * 2); // Get more to account for duplicates

    if (error) throw error;

    // Group by apartment and count posts
    const apartmentPostCounts: Record<string, { apartment: VietnameseApartment; count: number }> = {};
    
    activeApartments?.forEach((post) => {
      const apt = Array.isArray(post.apartments) ? post.apartments[0] : post.apartments;
      if (apt) {
        if (!apartmentPostCounts[apt.id]) {
          apartmentPostCounts[apt.id] = {
            apartment: apt as unknown as VietnameseApartment,
            count: 0,
          };
        }
        apartmentPostCounts[apt.id].count++;
      }
    });

    // Return apartments sorted by activity
    return Object.values(apartmentPostCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ apartment }) => apartment);
  } catch (error) {
    console.error("Error getting apartments with recent activity:", error);
    return [];
  }
}

/**
 * Get apartments by user count (apartments with most active users)
 */
export async function getApartmentsByUserCount(
  limit: number = 20
): Promise<VietnameseApartment[]> {
  const supabase = await createClient();

  try {
    const { data: userApartments, error } = await supabase
      .from("user_locations")
      .select(
        `
        apartment_id,
        apartments!inner(
          id, name, name_ko, name_en, district, district_ko, address, address_ko,
          city_id, latitude, longitude, is_featured
        )
      `
      )
      .not("apartment_id", "is", null)
      .limit(limit * 2); // Get more to account for duplicates

    if (error) throw error;

    // Group by apartment and count users
    const apartmentUserCounts: Record<string, { apartment: VietnameseApartment; count: number }> = {};
    
    userApartments?.forEach((userLoc) => {
      const apt = Array.isArray(userLoc.apartments) ? userLoc.apartments[0] : userLoc.apartments;
      if (apt) {
        if (!apartmentUserCounts[apt.id]) {
          apartmentUserCounts[apt.id] = {
            apartment: apt as unknown as VietnameseApartment,
            count: 0,
          };
        }
        apartmentUserCounts[apt.id].count++;
      }
    });

    // Return apartments sorted by user count
    return Object.values(apartmentUserCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ apartment }) => apartment);
  } catch (error) {
    console.error("Error getting apartments by user count:", error);
    return [];
  }
}

/**
 * Get all apartments with comprehensive filtering options
 */
export async function getAllVietnameseApartments(params: {
  cityId?: string;
  featured?: boolean;
  withActivity?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<VietnameseApartment[]> {
  const supabase = await createClient();
  const { cityId, featured, withActivity, limit = 50, offset = 0 } = params;

  try {
    let query = supabase
      .from("apartments")
      .select(
        `
        id, name, name_ko, name_en, district, district_ko, address, address_ko,
        city_id, latitude, longitude, is_featured,
        cities!inner(name, name_ko, country)
      `
      )
      .eq("cities.country", "Vietnam");

    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    if (featured !== undefined) {
      query = query.eq("is_featured", featured);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Default ordering by name
    query = query.order("name", { ascending: true });

    const { data: apartments, error } = await query;

    if (error) throw error;

    // If withActivity is true, get activity data and sort by it
    if (withActivity && apartments && apartments.length > 0) {
      const apartmentIds = apartments.map(apt => apt.id);
      
      // Get recent activity counts
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activityData } = await supabase
        .from("community_posts")
        .select("apartment_id")
        .in("apartment_id", apartmentIds)
        .eq("is_deleted", false)
        .eq("status", "published")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Count posts per apartment
      const activityCounts: Record<string, number> = {};
      activityData?.forEach(post => {
        activityCounts[post.apartment_id] = (activityCounts[post.apartment_id] || 0) + 1;
      });

      // Sort apartments by activity count
      apartments.sort((a, b) => (activityCounts[b.id] || 0) - (activityCounts[a.id] || 0));
    }

    return apartments || [];
  } catch (error) {
    console.error("Error getting all Vietnamese apartments:", error);
    return [];
  }
}

/**
 * Get popular Vietnamese locations for suggestions
 * Enhanced to include apartments with recent community activity, not just featured ones
 */
export async function getPopularVietnameseLocations(): Promise<
  LocationSearchResult[]
> {
  const supabase = await createClient();

  try {
    // Get major cities first
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id, name, name_ko, name_en")
      .eq("country", "Vietnam")
      .eq("is_major_city", true)
      .order("name");

    if (citiesError) throw citiesError;

    // Get apartments with a multi-criteria approach
    const apartmentIds = new Set<string>();
    const allApartments: ProcessedApartment[] = [];

    // 1. Get featured apartments (highest priority)
    const { data: featuredApartments, error: featuredError } = await supabase
      .from("apartments")
      .select(
        `
        id, name, name_ko, name_en, district, district_ko,
        cities!inner(name, name_ko, country)
      `
      )
      .eq("is_featured", true)
      .eq("cities.country", "Vietnam")
      .order("name")
      .limit(8);

    if (!featuredError && featuredApartments) {
      featuredApartments.forEach((apt) => {
        apartmentIds.add(apt.id);
        allApartments.push({
          ...apt,
          cities: Array.isArray(apt.cities) ? apt.cities[0] : apt.cities,
          priority: 3,
        });
      });
    }

    // 2. Get apartments with recent community activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activeApartments, error: activeError } = await supabase
      .from("community_posts")
      .select(
        `
        apartment_id,
        apartments!inner(
          id, name, name_ko, name_en, district, district_ko,
          cities!inner(name, name_ko, country)
        )
      `
      )
      .eq("is_deleted", false)
      .eq("status", "published")
      .eq("apartments.cities.country", "Vietnam")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(15);

    if (!activeError && activeApartments) {
      // Group by apartment and count posts
      const apartmentPostCounts: Record<string, { apartment: VietnameseApartment; count: number }> = {};
      
      activeApartments.forEach((post) => {
        const apt = Array.isArray(post.apartments) ? post.apartments[0] : post.apartments;
        if (apt && !apartmentIds.has(apt.id)) {
          if (!apartmentPostCounts[apt.id]) {
            apartmentPostCounts[apt.id] = {
              apartment: apt as unknown as VietnameseApartment,
              count: 0,
            };
          }
          apartmentPostCounts[apt.id].count++;
        }
      });

      // Add apartments with most recent activity
      Object.values(apartmentPostCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .forEach(({ apartment }) => {
          apartmentIds.add(apartment.id);
          const cities = (apartment as ApartmentWithCity).cities;
          allApartments.push({
            ...apartment,
            cities: Array.isArray(cities) ? cities[0] : cities,
            priority: 2,
          });
        });
    }

    // 3. Get apartments with active users (fallback if we need more)
    if (allApartments.length < 12) {
      const { data: userApartments, error: userError } = await supabase
        .from("user_locations")
        .select(
          `
          apartment_id,
          apartments!inner(
            id, name, name_ko, name_en, district, district_ko,
            cities!inner(name, name_ko, country)
          )
        `
        )
        .eq("apartments.cities.country", "Vietnam")
        .not("apartment_id", "is", null)
        .limit(10);

      if (!userError && userApartments) {
        // Group by apartment and count users
        const apartmentUserCounts: Record<string, { apartment: VietnameseApartment; count: number }> = {};
        
        userApartments.forEach((userLoc) => {
          const apt = Array.isArray(userLoc.apartments) ? userLoc.apartments[0] : userLoc.apartments;
          if (apt && !apartmentIds.has(apt.id)) {
            if (!apartmentUserCounts[apt.id]) {
              apartmentUserCounts[apt.id] = {
                apartment: apt as unknown as VietnameseApartment,
                count: 0,
              };
            }
            apartmentUserCounts[apt.id].count++;
          }
        });

        // Add apartments with most users
        Object.values(apartmentUserCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, Math.max(0, 12 - allApartments.length))
          .forEach(({ apartment }) => {
            apartmentIds.add(apartment.id);
            const cities = (apartment as ApartmentWithCity).cities;
            allApartments.push({
              ...apartment,
              cities: Array.isArray(cities) ? cities[0] : cities,
              priority: 1,
            });
          });
      }
    }

    const results: LocationSearchResult[] = [];

    // Add cities
    cities?.forEach((city) => {
      results.push({
        id: city.id,
        type: "city",
        name: city.name,
        name_ko: city.name_ko,
        name_en: city.name_en,
        full_address: city.name,
        full_address_ko: city.name_ko,
        city_name: city.name,
        city_name_ko: city.name_ko,
        similarity_score: 1.0,
      });
    });

    // Add apartments sorted by priority (featured first, then by activity)
    allApartments
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 15) // Limit total apartments
      .forEach((apartment) => {
        const city = (apartment as ProcessedApartment).cities;
        const fullAddress = apartment.district
          ? `${city.name}, ${apartment.district}, ${apartment.name}`
          : `${city.name}, ${apartment.name}`;
        const fullAddressKo =
          apartment.district_ko && city.name_ko && apartment.name_ko
            ? `${city.name_ko}, ${apartment.district_ko}, ${apartment.name_ko}`
            : city.name_ko && apartment.name_ko
              ? `${city.name_ko}, ${apartment.name_ko}`
              : fullAddress;

        results.push({
          id: apartment.id,
          type: "apartment",
          name: apartment.name,
          name_ko: apartment.name_ko,
          name_en: apartment.name_en,
          full_address: fullAddress,
          full_address_ko: fullAddressKo,
          city_name: city.name,
          city_name_ko: city.name_ko,
          district: apartment.district,
          district_ko: apartment.district_ko,
          similarity_score: apartment.priority === 3 ? 0.9 : apartment.priority === 2 ? 0.8 : 0.7,
        });
      });

    return results;
  } catch (error) {
    console.error("Error getting popular Vietnamese locations:", error);
    return [];
  }
}
