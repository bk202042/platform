import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  PropertyListing,
  PropertyType,
  PropertyImage,
} from "@/lib/types/property";
import { unstable_cache } from "next/cache";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

// Define a type for the processed image object, extending the base PropertyImage
type ProcessedPropertyImage = PropertyImage & { publicUrl: string | null };

// Define the return type for processed properties, including the processed images array
type ProcessedPropertyListing = Omit<PropertyListing, "property_images"> & {
  primary_image?: string | null;
  property_images?: ProcessedPropertyImage[]; // Use processed images here
};

export interface PropertySearchParams {
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  minBedrooms?: number;
  minBathrooms?: number;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  limit?: number;
  offset?: number;
}

export interface PropertySearchResult {
  data: ProcessedPropertyListing[]; // Use processed type
  total: number;
  hasMore: boolean;
}

// Helper function to process images and add public URLs + primary image
function processPropertyImages(
  property: PropertyListing,
  images: PropertyImage[], // Pass fetched images separately
  supabase: SupabaseClient, // Pass Supabase client instance
): ProcessedPropertyListing {
  const imagesWithPublicUrls = (images || []).map(
    (img): ProcessedPropertyImage => {
      let storagePath = img.storage_path; // Use storage_path from type
      if (!storagePath) return { ...img, publicUrl: null };

      // Ensure the path passed to getPublicUrl doesn't include the bucket name if storage_path already has it.
      const bucketName = "platform";
      if (storagePath.startsWith(`${bucketName}/`)) {
        storagePath = storagePath.substring(bucketName.length + 1);
      } else if (storagePath.startsWith(`/${bucketName}/`)) {
        // Handle cases where it might start with /platform/
        storagePath = storagePath.substring(bucketName.length + 2);
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName) // Use bucket name variable
        .getPublicUrl(storagePath); // Use the potentially modified storagePath
      return {
        ...img,
        publicUrl: publicUrlData?.publicUrl || null,
      };
    },
  );

  const primaryImage =
    imagesWithPublicUrls.find((img) => img.is_primary)?.publicUrl ||
    imagesWithPublicUrls[0]?.publicUrl ||
    "/assets/images/property-placeholder.jpg"; // Fallback

  // Return property data with processed images and primary image URL
  return {
    ...property,
    property_images: imagesWithPublicUrls, // Assign processed images array
    primary_image: primaryImage,
  };
}

// Cache the property listings for 1 minute
const getCachedPropertyListings = unstable_cache(
  async (params: PropertySearchParams = {}): Promise<PropertySearchResult> => {
    const supabase = await createClient();
    const {
      searchText,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      minBathrooms,
      lat,
      lng,
      radiusMeters,
      limit = 10,
      offset = 0,
    } = params;

    let propertyData: PropertyListing[] = [];
    let totalCount = 0;
    let fetchError: PostgrestError | null = null;

    // --- Fetch Main Property Data ---
    if (lat !== undefined && lng !== undefined) {
      // RPC Call - Assuming it returns basic property data
      const {
        data: rpcData,
        error: rpcError,
        count,
      } = await supabase
        .rpc("search_properties", {
          search_text: searchText || null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          property_type_filter: propertyType || null,
          min_bedrooms: minBedrooms || null,
          min_bathrooms: minBathrooms || null,
          lat,
          lng,
          radius_meters: radiusMeters || 5000,
        })
        .range(offset, offset + limit - 1)
        .order("distance_meters", { ascending: true });

      fetchError = rpcError;
      propertyData = (rpcData || []) as PropertyListing[];
      totalCount = count || 0;
    } else {
      // Regular Query - Fetch property data
      let query = supabase.from("property_listings").select(`*`);

      // Apply filters
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

      // Fetch data
      const { data, error: dataError } = await query
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      fetchError = dataError;
      propertyData = (data || []) as PropertyListing[];

      // Fetch count separately
      if (!fetchError) {
        let countQuery = supabase
          .from("property_listings")
          .select("*", { count: "exact", head: true });
        // Re-apply filters for accurate count
        if (searchText) {
          countQuery = countQuery.or(
            `title.ilike.%${searchText}%,description.ilike.%${searchText}%`,
          );
        }
        if (minPrice !== undefined) {
          countQuery = countQuery.gte("price", minPrice);
        }
        if (maxPrice !== undefined) {
          countQuery = countQuery.lte("price", maxPrice);
        }
        if (propertyType) {
          countQuery = countQuery.eq("property_type", propertyType);
        }
        if (minBedrooms !== undefined) {
          countQuery = countQuery.gte("bedrooms", minBedrooms);
        }
        if (minBathrooms !== undefined) {
          countQuery = countQuery.gte("bathrooms", minBathrooms);
        }
        const { count, error: countError } = await countQuery;
        if (countError) {
          console.error("Error fetching count:", countError);
        } else {
          totalCount = count || 0;
        }
      }
    }

    if (fetchError) {
      console.error("Error fetching property data:", fetchError);
      throw fetchError;
    }

    // --- Fetch Images Separately ---
    const propertyIds = propertyData
      .map((p) => p.id)
      .filter((id) => id !== undefined) as string[];
    let allImages: PropertyImage[] = [];
    if (propertyIds.length > 0) {
      const { data: imageData, error: imageError } = await supabase
        .from("property_images")
        .select("*")
        .in("property_id", propertyIds)
        .order("display_order", { ascending: true });

      if (imageError) {
        console.error("Error fetching property images:", imageError);
      } else {
        allImages = (imageData || []) as PropertyImage[];
      }
    }

    // --- Process and Combine Data ---
    const processedData = propertyData.map((property) => {
      const relatedImages = allImages.filter(
        (img) => img.property_id === property.id,
      );
      return processPropertyImages(property, relatedImages, supabase);
    });

    return {
      data: processedData,
      total: totalCount,
      hasMore: totalCount > offset + limit,
    };
  },
  // Corrected cache key: Static base key array. Args (params) are automatically included by Next.js.
  [`property-listings`],
  {
    tags: ["property-listings"], // Static tag for general revalidation
    revalidate: 60,
  },
);

// Public function that uses the cached version
export async function getPropertyListings(
  params: PropertySearchParams = {},
): Promise<PropertySearchResult> {
  return getCachedPropertyListings(params);
}

// Cache property details for 5 minutes
const getCachedPropertyById = unstable_cache(
  async (id: string): Promise<ProcessedPropertyListing | null> => {
    const supabase = await createClient();

    // Fetch property data
    const { data: propertyData, error: propertyError } = await supabase
      .from("property_listings")
      .select(`*`) // Select only from property_listings
      .eq("id", id)
      .single();

    if (propertyError) {
      if (propertyError.code === "PGRST116") {
        return null;
      }
      console.error(`Error fetching property ${id}:`, propertyError);
      throw propertyError;
    }
    if (!propertyData) {
      // console.log(`[getCachedPropertyById] Property not found for ID: ${id}`); // Removed log
      return null;
    }
    // console.log(`[getCachedPropertyById] Fetched property data for ID ${id}:`, JSON.stringify(propertyData, null, 2)); // Removed log

    // Fetch images separately
    const { data: imageData, error: imageError } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("display_order", { ascending: true });

    if (imageError) {
      console.error(`Error fetching images for property ${id}:`, imageError);
    }
    // console.log(`[getCachedPropertyById] Fetched image data for ID ${id}:`, JSON.stringify(imageData, null, 2)); // Removed log

    // Process images
    const processedData = processPropertyImages(
      propertyData as PropertyListing,
      (imageData || []) as PropertyImage[],
      supabase,
    );
    // console.log(`[getCachedPropertyById] Processed data for ID ${id}:`, JSON.stringify(processedData, null, 2)); // Removed log

    return processedData;
  },
  // Corrected cache key: Base key array. Args (id) are automatically included.
  [`property-by-id`], // Static base key
  {
    // Corrected tags: Static array of strings. Dynamic invalidation relies on args.
    tags: [`property-details`],
    revalidate: 300,
  },
);

// Public function to get property by ID
export async function getPropertyById(
  id: string,
): Promise<ProcessedPropertyListing | null> {
  return getCachedPropertyById(id);
}

// Get similar properties - simplified, returns basic data
export async function getSimilarProperties(
  property: PropertyListing,
  limit = 3,
): Promise<PropertyListing[]> {
  const supabase = await createClient();

  let query = supabase
    .from("property_listings")
    .select("*") // Select basic fields
    .neq("id", property.id)
    .eq("property_type", property.property_type);

  const minPrice = property.price * 0.7;
  const maxPrice = property.price * 1.3;
  query = query.gte("price", minPrice).lte("price", maxPrice);

  if (property.bedrooms) {
    query = query.or(
      `bedrooms.eq.${property.bedrooms},bedrooms.eq.${property.bedrooms - 1},bedrooms.eq.${property.bedrooms + 1}`,
    );
  }
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// CRUD Operations
export async function createProperty(
  property: Omit<
    PropertyListing,
    "id" | "created_at" | "property_images" | "primary_image"
  >,
): Promise<PropertyListing> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_listings")
    .insert(property)
    .select()
    .single();
  if (error) throw error;
  return data as PropertyListing;
}

export async function updateProperty(
  id: string,
  updates: Partial<PropertyListing>,
): Promise<PropertyListing> {
  const supabase = await createClient();
  // Exclude processed fields explicitly before update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { property_images, primary_image, ...validUpdates } = updates;
  // Use the validUpdates object which doesn't contain the excluded fields
  const { data, error } = await supabase
    .from("property_listings")
    .update(validUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PropertyListing;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const supabase = await createClient();
  // TODO: Consider deleting related images from storage and property_images table first
  const { error } = await supabase
    .from("property_listings")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

// Fetches and processes images for a specific property ID
export async function getPropertyImages(
  propertyId: string,
): Promise<ProcessedPropertyImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("display_order");

  if (error) {
    console.error("Error fetching property images:", error);
    return [];
  }

  const imagesWithPublicUrls = (data || []).map(
    (img: PropertyImage): ProcessedPropertyImage => {
      const imagePath = img.storage_path;
      if (!imagePath) return { ...img, publicUrl: null };
      const { data: publicUrlData } = supabase.storage
        .from("platform")
        .getPublicUrl(imagePath);
      return { ...img, publicUrl: publicUrlData?.publicUrl || null };
    },
  );

  return imagesWithPublicUrls;
}

// Add a new image record
export async function addPropertyImage(
  propertyId: string,
  imageData: Omit<
    PropertyImage,
    "id" | "created_at" | "updated_at" | "url" | "publicUrl"
  >,
): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  return await supabase
    .from("property_images")
    .insert(imageData)
    .select()
    .single();
}

// Update display order
export async function updatePropertyImageOrder(
  imageId: string,
  newOrder: number,
): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  return await supabase
    .from("property_images")
    .update({ display_order: newOrder })
    .eq("id", imageId)
    .select()
    .single();
}

// Delete image record
export async function deletePropertyImage(
  imageId: string,
): Promise<{ data: PropertyImage | null; error: PostgrestError | null }> {
  const supabase = await createClient();
  // TODO: Add logic to delete from storage bucket using img.storage_path before deleting DB record
  return await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .select()
    .single();
}
