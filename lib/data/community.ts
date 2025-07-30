import { CommunityCategory } from "../validation/community";
import { createClient } from "../supabase/server";
import { Comment } from "@/components/community/CommentSection";
import {
  PostImage,
  CreatePostImageData,
  ImageUploadResult,
  ImageReorderData,
  ImageValidationResult,
  EnhancedError,
} from "../types/community";
import { createPublicUrl } from "../utils/community-images";

// 게시글 목록 조회
export async function getPosts(params: {
  city?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  sort?: "popular" | "latest";
}) {
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select(`*, apartments(city_id, name, slug, cities(name))`) // join apartments for city filter
    .eq("is_deleted", false);

  if (params.apartmentId) {
    query = query.eq("apartment_id", params.apartmentId);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.city) {
    query = query.eq("apartments.city_id", params.city);
  }

  // 인기글: 7일 내 좋아요순 상단, 나머지 최신순
  if (params.sort === "popular") {
    // 7일 내 글 중 좋아요순 정렬
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("likes_count", { ascending: false });
  } else {
    // 최신순
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// 게시글 상세 조회
export async function getPostById(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select(`
      *, 
      apartments(city_id, name, slug, cities(name)),
      community_post_images(id, storage_path, display_order, alt_text, metadata, created_at)
    `)
    .eq("id", postId)
    .eq("is_deleted", false)
    .single();
  if (error) {
    console.error("getPostById error:", error);
    return null;
  }
  
  // Transform images to include public URLs
  if (data) {
    if (data.community_post_images && Array.isArray(data.community_post_images) && data.community_post_images.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      interface RawImageData {
        display_order: number;
        storage_path: string;
        [key: string]: unknown;
      }
      data.images = (data.community_post_images as RawImageData[])
        .sort((a, b) => a.display_order - b.display_order)
        .map((image) => ({
          ...image,
          post_id: data.id,
          public_url: createPublicUrl(image.storage_path, supabaseUrl),
          alt_text: image.alt_text || undefined,
        }));
    } else {
      // Ensure images is always an empty array when no images exist
      data.images = [];
    }
    // Remove the raw data
    delete data.community_post_images;
  }
  
  return data;
}

// 게시글 상세 조회 (사용자 좋아요 상태 포함)
export async function getPostByIdWithLikeStatus(
  postId: string,
  userId?: string
) {
  const supabase = await createClient();

  // Get post data with images and user profile
  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select(`
      *, 
      apartments(city_id, name, slug, cities(name)),
      community_post_images(id, storage_path, display_order, alt_text, metadata, created_at),
      profiles!community_posts_user_id_fkey (
        id,
        first_name,
        last_name,
        avatar_url,
        email
      )
    `)
    .eq("id", postId)
    .eq("is_deleted", false)
    .single();

  if (postError) {
    console.error("getPostByIdWithLikeStatus error:", postError);
    return null;
  }

  // Transform images to include public URLs
  if (post) {
    if (post.community_post_images && Array.isArray(post.community_post_images) && post.community_post_images.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      interface RawImageData {
        display_order: number;
        storage_path: string;
        [key: string]: unknown;
      }
      post.images = (post.community_post_images as RawImageData[])
        .sort((a, b) => a.display_order - b.display_order)
        .map((image) => ({
          ...image,
          post_id: post.id,
          public_url: createPublicUrl(image.storage_path, supabaseUrl),
        }));
    } else {
      // Ensure images is always an empty array when no images exist
      post.images = [];
    }
    // Remove the raw data
    delete post.community_post_images;
  }

  // Get user's like status if user is provided
  let isLiked = false;
  if (userId) {
    const { data: likeData } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    isLiked = !!likeData;
  }

  // Format user profile data
  const profile = post.profiles;
  const displayName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.email?.split("@")[0] ||
      "익명"
    : "익명";

  return {
    ...post,
    isLiked,
    user: {
      name: displayName,
      avatar_url: profile?.avatar_url,
    },
  };
}

// 게시글 목록 조회 (사용자 좋아요 상태 및 작성자 정보 포함)
export async function getPostsWithLikeStatus(params: {
  city?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  sort?: "popular" | "latest";
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select(
      `
      *,
      apartments(city_id, name, slug, cities(name)),
      profiles!community_posts_user_id_fkey (
        id,
        first_name,
        last_name,
        avatar_url,
        email
      )
    `
    )
    .eq("is_deleted", false)
    .eq("status", "published");

  if (params.apartmentId) {
    query = query.eq("apartment_id", params.apartmentId);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.city) {
    query = query.eq("apartments.city_id", params.city);
  }

  // 페이지네이션
  if (params.limit) {
    query = query.limit(params.limit);
  }
  if (params.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit || 10) - 1
    );
  }

  // 정렬
  if (params.sort === "popular") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: posts, error } = await query;
  if (error) throw error;

  if (!posts) return [];

  // Get user's like status for all posts if user is provided
  let likedPostIds = new Set<string>();
  if (params.userId && posts.length > 0) {
    const postIds = posts.map((post) => post.id);
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", params.userId)
      .in("post_id", postIds);

    likedPostIds = new Set(likes?.map((like) => like.post_id) || []);
  }

  return posts.map((post) => {
    const profile = post.profiles;
    const displayName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        profile.email?.split("@")[0] ||
        "익명"
      : "익명";

    return {
      ...post,
      isLiked: likedPostIds.has(post.id),
      user: {
        name: displayName,
        avatar_url: profile?.avatar_url,
      },
    };
  });
}

// 게시글 생성
export async function createPost(data: {
  apartment_id: string;
  category: CommunityCategory;
  title?: string;
  body: string;
  images?: string[];
  user_id: string;
}) {
  // Enhanced logging for data layer operations
  console.log(`INFO|data_layer|createPost|user_id=${data.user_id}|apartment_id=${data.apartment_id}|category=${data.category}`);
  
  try {
    const supabase = await createClient();
    
    // Log the data being inserted for debugging
    const insertData = {
      apartment_id: data.apartment_id,
      category: data.category,
      title: data.title,
      body: data.body,
      user_id: data.user_id,
      status: "published",
    };
    
    console.log(`INFO|data_layer|createPost|insert_attempt|data=${JSON.stringify(insertData)}`);
    
    const { data: post, error } = await supabase
      .from("community_posts")
      .insert([insertData])
      .select()
      .single();
      
    if (error) {
      // Enhanced error classification for data layer
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Unknown database error';
      const errorDetails = error.details || 'No additional details';
      
      console.error(`ERROR|data_layer|createPost|${errorCode}|${errorMessage}|user_id=${data.user_id}`);
      console.error(`ERROR|data_layer|createPost|full_error|${JSON.stringify(error, null, 2)}`);
      
      // Create enhanced error with classification
      const enhancedError: EnhancedError = new Error(errorMessage);
      enhancedError.code = errorCode;
      enhancedError.details = errorDetails;
      enhancedError.context = 'data_layer';
      enhancedError.operation = 'createPost';
      enhancedError.user_id = data.user_id;
      enhancedError.apartment_id = data.apartment_id;
      
      // Add specific error classification
      switch (errorCode) {
        case '23503': // Foreign key violation
          enhancedError.category = 'FOREIGN_KEY_VIOLATION';
          enhancedError.message = `Invalid apartment_id: ${data.apartment_id}. Please select a valid apartment.`;
          break;
        case '23502': // Not null violation
          enhancedError.category = 'NULL_VIOLATION';
          enhancedError.message = `Missing required field. ${errorDetails}`;
          break;
        case '23505': // Unique violation
          enhancedError.category = 'UNIQUE_VIOLATION';
          enhancedError.message = `Duplicate post detected. Please modify your content.`;
          break;
        case 'PGRST301': // RLS policy violation
          enhancedError.category = 'RLS_VIOLATION';
          enhancedError.message = `Permission denied for user ${data.user_id} in apartment ${data.apartment_id}`;
          break;
        case '08P01': // Connection error
          enhancedError.category = 'CONNECTION_ERROR';
          enhancedError.message = `Database connection failed. Please try again.`;
          break;
        case '42501': // Insufficient privilege
          enhancedError.category = 'INSUFFICIENT_PRIVILEGE';
          enhancedError.message = `Insufficient database privileges for user ${data.user_id}`;
          break;
        default:
          enhancedError.category = 'UNKNOWN_DB_ERROR';
          enhancedError.message = `Database error (${errorCode}): ${errorMessage}`;
      }
      
      throw enhancedError;
    }
    
    console.log(`SUCCESS|data_layer|createPost|post_created|post_id=${post.id}|user_id=${data.user_id}`);
    return post;
  } catch (error) {
    // Handle non-database errors (network, parsing, etc.)
    const enhancedErr = error as EnhancedError;
    if (!enhancedErr.code) {
      console.error(`ERROR|data_layer|createPost|non_db_error|${error}|user_id=${data.user_id}`);
      
      const networkError: EnhancedError = new Error(`Failed to create post: ${error}`);
      networkError.category = 'NETWORK_ERROR';
      networkError.context = 'data_layer';
      networkError.operation = 'createPost';
      networkError.user_id = data.user_id;
      
      throw networkError;
    }
    
    // Re-throw enhanced database errors
    throw error;
  }
}

// 댓글 목록 조회 (개선된 버전)
export async function getComments(postId: string) {
  const supabase = await createClient();

  // Get comments with user profile data in a single query
  const { data: commentsData, error } = await supabase
    .from("community_comments")
    .select(
      `
      id,
      content,
      created_at,
      parent_id,
      user_id,
      profiles!community_comments_user_id_fkey (
        id,
        first_name,
        last_name,
        avatar_url,
        email
      )
    `
    )
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getComments error:", error);
    return [];
  }

  if (!commentsData || commentsData.length === 0) {
    return [];
  }

  // Transform data to match Comment interface and build hierarchy
  const comments = commentsData.map((comment) => {
    const profile = Array.isArray(comment.profiles)
      ? comment.profiles[0]
      : comment.profiles;
    const displayName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        profile.email?.split("@")[0] ||
        "익명"
      : "익명";

    return {
      id: comment.id,
      body: comment.content,
      user: {
        name: displayName,
        avatar_url: profile?.avatar_url,
      },
      created_at: comment.created_at,
      parent_id: comment.parent_id,
      user_id: comment.user_id,
      children: [] as Comment[],
    };
  });

  // Build comment hierarchy
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, comment);
  });

  // Second pass: build hierarchy
  comments.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent && parent.children) {
        parent.children.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

// 댓글 생성
export async function createComment(data: {
  post_id: string;
  parent_id?: string | null;
  body: string;
  user_id: string;
}) {
  const supabase = await createClient();
  const { data: comment, error } = await supabase
    .from("community_comments")
    .insert([
      {
        post_id: data.post_id,
        parent_id: data.parent_id ?? null,
        content: data.body,
        user_id: data.user_id,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return comment;
}

// 좋아요 토글
export async function toggleLike(postId: string, userId: string) {
  const supabase = await createClient();
  // 좋아요 존재 여부 확인
  const { data: existing, error: selectError } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (selectError && selectError.code !== "PGRST116") throw selectError;

  if (existing) {
    // 이미 좋아요가 있으면 삭제
    const { error: deleteError } = await supabase
      .from("community_likes")
      .delete()
      .eq("id", existing.id);
    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    // 없으면 추가
    const { error: insertError } = await supabase
      .from("community_likes")
      .insert([{ post_id: postId, user_id: userId }]);
    if (insertError) throw insertError;
    return { liked: true };
  }
}

// 도시 목록 조회
export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

// 아파트 목록 조회 (도시 이름 포함)
export async function getApartments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, city_id, cities(name)")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

// 카테고리별 게시글 수 조회
export async function getPostCountsByCategory(params?: {
  city?: string;
  apartmentId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select("category, apartments(city_id)", { count: "exact" })
    .eq("is_deleted", false);

  if (params?.apartmentId) {
    query = query.eq("apartment_id", params.apartmentId);
  }
  if (params?.city) {
    query = query.eq("apartments.city_id", params.city);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Count posts by category
  const counts: Record<string, number> = {};
  let totalCount = 0;

  data?.forEach((post) => {
    const category = post.category;
    counts[category] = (counts[category] || 0) + 1;
    totalCount++;
  });

  return {
    total: totalCount,
    byCategory: counts,
  };
}

// Location-based post queries
export async function getPostsByUserLocations(params: {
  userId: string;
  category?: CommunityCategory;
  sort?: "popular" | "latest";
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_posts_by_user_locations", {
    user_uuid: params.userId,
    category_filter: params.category || null,
    sort_option: params.sort || "latest",
    limit_count: params.limit || 20,
    offset_count: params.offset || 0,
  });

  if (error) {
    console.error("Error fetching posts by user locations:", error);
    throw error;
  }

  return data || [];
}

// Enhanced location-aware post creation
export async function createPostWithLocation(data: {
  apartment_id: string;
  category: CommunityCategory;
  title?: string;
  body: string;
  images?: string[];
  user_id: string;
}) {
  const supabase = await createClient();

  // Verify the apartment exists and get location info
  const { data: apartment, error: apartmentError } = await supabase
    .from("apartments")
    .select("id, name, city_id, cities(name, name_ko)")
    .eq("id", data.apartment_id)
    .single();

  if (apartmentError || !apartment) {
    throw new Error("Invalid apartment ID");
  }

  // Create the post
  const { data: post, error } = await supabase
    .from("community_posts")
    .insert([
      {
        apartment_id: data.apartment_id,
        category: data.category,
        title: data.title,
        body: data.body,
        user_id: data.user_id,
        status: "published",
      },
    ])
    .select(
      `
      *,
      apartments(
        id, name, name_ko, district, district_ko,
        cities(name, name_ko)
      )
    `
    )
    .single();

  if (error) throw error;
  return post;
}

// Search posts with location context
export async function searchPostsWithLocation(params: {
  query: string;
  userId?: string;
  cityId?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("community_posts")
    .select(
      `
      *,
      apartments(
        id, name, name_ko, district, district_ko,
        cities(name, name_ko)
      ),
      profiles!community_posts_user_id_fkey (
        id, first_name, last_name, avatar_url, email
      )
    `
    )
    .eq("is_deleted", false)
    .eq("status", "published")
    .textSearch("search_vector", params.query);

  // Apply location filters
  if (params.apartmentId) {
    query = query.eq("apartment_id", params.apartmentId);
  } else if (params.cityId) {
    query = query.eq("apartments.city_id", params.cityId);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  // Apply pagination
  if (params.limit) {
    query = query.limit(params.limit);
  }
  if (params.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit || 10) - 1
    );
  }

  // Order by relevance and recency
  query = query.order("created_at", { ascending: false });

  const { data: posts, error } = await query;
  if (error) throw error;

  if (!posts) return [];

  // Get user's like status if user is provided
  let likedPostIds = new Set<string>();
  if (params.userId && posts.length > 0) {
    const postIds = posts.map((post) => post.id);
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", params.userId)
      .in("post_id", postIds);

    likedPostIds = new Set(likes?.map((like) => like.post_id) || []);
  }

  return posts.map((post) => {
    const profile = Array.isArray(post.profiles)
      ? post.profiles[0]
      : post.profiles;
    const displayName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        profile.email?.split("@")[0] ||
        "익명"
      : "익명";

    return {
      ...post,
      isLiked: likedPostIds.has(post.id),
      user: {
        name: displayName,
        avatar_url: profile?.avatar_url,
      },
    };
  });
}

// ============================================================================
// ENHANCED IMAGE MANAGEMENT SYSTEM
// ============================================================================

/**
 * Upload multiple images to Supabase storage for community posts
 * Handles file validation, metadata extraction, and storage path generation
 */
export async function uploadPostImages(
  files: File[],
  postId?: string
): Promise<ImageUploadResult[]> {
  const supabase = await createClient();

  const uploadPromises = files.map(async (file) => {
    // Validate file
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(`File ${file.name}: ${validation.errors.join(", ")}`);
    }

    // Generate unique file name
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${postId || "temp"}_${timestamp}_${randomId}.${fileExt}`;
    const filePath = `community-images/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("community-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("community-images").getPublicUrl(data.path);

    return {
      storage_path: data.path,
      public_url: publicUrl,
      metadata: {
        width: validation.metadata?.width,
        height: validation.metadata?.height,
        size: file.size,
        format: file.type,
        original_name: file.name,
      },
    };
  });

  return Promise.all(uploadPromises);
}

/**
 * Save uploaded images to the community_post_images table
 */
export async function savePostImages(
  postId: string,
  images: CreatePostImageData[]
): Promise<PostImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("community_post_images")
    .insert(
      images.map((img) => ({
        post_id: postId,
        storage_path: img.storage_path,
        display_order: img.display_order,
        alt_text: img.alt_text,
        metadata: img.metadata || {},
      }))
    )
    .select();

  if (error) {
    console.error("Save images error:", error);
    throw new Error(`Failed to save images: ${error.message}`);
  }

  return data as PostImage[];
}

/**
 * Get images for a specific post
 */
export async function getPostImages(postId: string): Promise<PostImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("community_post_images")
    .select("*")
    .eq("post_id", postId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Get post images error:", error);
    throw new Error(`Failed to get images: ${error.message}`);
  }

  return data as PostImage[];
}

/**
 * Delete an image from both storage and database
 */
export async function deletePostImage(imageId: string): Promise<void> {
  const supabase = await createClient();

  // First get the image to get storage path
  const { data: image, error: getError } = await supabase
    .from("community_post_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (getError) {
    console.error("Get image error:", getError);
    throw new Error(`Failed to get image: ${getError.message}`);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("community-images")
    .remove([image.storage_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Continue with database deletion even if storage fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("community_post_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    console.error("Database delete error:", dbError);
    throw new Error(`Failed to delete image from database: ${dbError.message}`);
  }
}

/**
 * Reorder images by updating their display_order
 */
export async function reorderPostImages(
  reorderData: ImageReorderData[]
): Promise<void> {
  const supabase = await createClient();

  const updatePromises = reorderData.map(({ id, display_order }) =>
    supabase
      .from("community_post_images")
      .update({ display_order })
      .eq("id", id)
  );

  const results = await Promise.all(updatePromises);

  // Check for errors
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.error("Reorder errors:", errors);
    throw new Error("Failed to reorder some images");
  }
}

/**
 * Validate image file before upload
 */
export async function validateImageFile(
  file: File
): Promise<ImageValidationResult> {
  const errors: string[] = [];

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      "지원되지 않는 파일 형식입니다. JPG, PNG, WEBP, GIF만 허용됩니다."
    );
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push("파일 크기가 5MB를 초과합니다.");
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push("파일명이 너무 깁니다.");
  }

  let metadata:
    | { width: number; height: number; size: number; format: string }
    | undefined;

  // Extract image metadata
  if (errors.length === 0 && file.type.startsWith("image/")) {
    try {
      metadata = await extractImageMetadata(file);

      // Check image dimensions (optional limits)
      if (metadata.width > 4000 || metadata.height > 4000) {
        errors.push(
          "이미지 크기가 너무 큽니다. 최대 4000x4000 픽셀까지 허용됩니다."
        );
      }

      if (metadata.width < 50 || metadata.height < 50) {
        errors.push(
          "이미지 크기가 너무 작습니다. 최소 50x50 픽셀 이상이어야 합니다."
        );
      }
    } catch (_error) {
      errors.push("이미지 메타데이터를 읽을 수 없습니다.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    metadata,
  };
}

/**
 * Extract metadata from image file
 */
async function extractImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: file.type,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Create post with enhanced image management
 */
export async function createPostWithImages(data: {
  apartment_id: string;
  category: CommunityCategory;
  title?: string;
  body: string;
  user_id: string;
  imageFiles?: File[];
}): Promise<{ post: unknown; images: PostImage[] }> {
  const supabase = await createClient();

  // Create the post first
  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .insert([
      {
        apartment_id: data.apartment_id,
        category: data.category,
        title: data.title,
        body: data.body,
        user_id: data.user_id,
        status: "published",
      },
    ])
    .select()
    .single();

  if (postError) {
    console.error("Create post error:", postError);
    throw new Error(`Failed to create post: ${postError.message}`);
  }

  let images: PostImage[] = [];

  // Upload and save images if provided
  if (data.imageFiles && data.imageFiles.length > 0) {
    try {
      // Upload images to storage
      const uploadResults = await uploadPostImages(data.imageFiles, post.id);

      // Prepare image data for database
      const imageData: CreatePostImageData[] = uploadResults.map(
        (result, index) => ({
          storage_path: result.storage_path,
          display_order: index,
          alt_text: result.metadata.original_name,
          metadata: result.metadata,
        })
      );

      // Save to database
      images = await savePostImages(post.id, imageData);
    } catch (error) {
      // If image upload fails, we should clean up the post
      await supabase.from("community_posts").delete().eq("id", post.id);
      throw error;
    }
  }

  return { post, images };
}
