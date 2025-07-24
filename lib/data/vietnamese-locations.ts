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
 * Get popular Vietnamese locations for suggestions
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

    // Get featured apartments
    const { data: apartments, error: apartmentsError } = await supabase
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
      .limit(10);

    if (apartmentsError) throw apartmentsError;

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

    // Add featured apartments
    apartments?.forEach((apartment) => {
      const city = Array.isArray(apartment.cities)
        ? apartment.cities[0]
        : apartment.cities;
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
        similarity_score: 0.9,
      });
    });

    return results;
  } catch (error) {
    console.error("Error getting popular Vietnamese locations:", error);
    return [];
  }
}
