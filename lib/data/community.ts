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
      community_post_images(id, storage_path, display_order, alt_text, metadata, created_at),
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

    // Transform images to include public URLs
    let images: PostImage[] = [];
    if (post.community_post_images && Array.isArray(post.community_post_images) && post.community_post_images.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      interface RawImageData {
        id: string;
        display_order: number;
        storage_path: string;
        alt_text?: string;
        metadata: Record<string, unknown>;
        created_at: string;
        [key: string]: unknown;
      }
      images = (post.community_post_images as RawImageData[])
        .sort((a, b) => a.display_order - b.display_order)
        .map((image) => ({
          id: image.id,
          post_id: post.id,
          storage_path: image.storage_path,
          display_order: image.display_order,
          alt_text: image.alt_text,
          metadata: image.metadata || {},
          created_at: image.created_at,
          public_url: createPublicUrl(image.storage_path, supabaseUrl),
        }));
    }

    return {
      ...post,
      images,
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
    const filePath = fileName; // Upload with just filename to bucket
    const storagePath = `community-images/${fileName}`; // Store full path in database

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
      storage_path: storagePath, // Use the full path for database constraint
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

// ============================================================================
// USER POST MANAGEMENT SYSTEM
// ============================================================================

/**
 * Get posts created by a specific user with comprehensive analytics
 */
export async function getUserPosts(params: {
  userId: string;
  status?: "draft" | "published" | "archived" | "all";
  category?: CommunityCategory;
  sort?: "latest" | "popular" | "engagement";
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from("community_posts")
    .select(`
      *,
      apartments(id, name, city_id, cities(name, name_ko)),
      community_post_images(id, storage_path, display_order, alt_text, metadata, created_at)
    `)
    .eq("user_id", params.userId)
    .eq("is_deleted", false);

  // Filter by status
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Filter by category
  if (params.category) {
    query = query.eq("category", params.category);
  }

  // Apply sorting
  switch (params.sort) {
    case "popular":
      query = query.order("likes_count", { ascending: false })
                   .order("created_at", { ascending: false });
      break;
    case "engagement":
      // Sort by total engagement (likes + comments + views)
      query = query.order("likes_count", { ascending: false })
                   .order("comments_count", { ascending: false })
                   .order("view_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
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

  const { data: posts, error } = await query;
  if (error) {
    console.error("getUserPosts error:", error);
    throw error;
  }

  if (!posts) return [];

  // Transform posts with image URLs
  return posts.map((post) => {
    let images: PostImage[] = [];
    if (post.community_post_images && Array.isArray(post.community_post_images) && post.community_post_images.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      images = post.community_post_images
        .sort((a: PostImage, b: PostImage) => a.display_order - b.display_order)
        .map((image: PostImage) => ({
          ...image,
          post_id: post.id,
          public_url: createPublicUrl(image.storage_path, supabaseUrl),
        }));
    }

    return {
      ...post,
      images,
    };
  });
}

/**
 * Get user post analytics and statistics
 */
export async function getUserPostAnalytics(userId: string) {
  const supabase = await createClient();

  // Get overall stats
  const { data: stats, error: statsError } = await supabase
    .from("community_posts")
    .select(`
      status,
      category,
      likes_count,
      comments_count,
      view_count,
      created_at
    `)
    .eq("user_id", userId)
    .eq("is_deleted", false);

  if (statsError) {
    console.error("getUserPostAnalytics error:", statsError);
    throw statsError;
  }

  if (!stats || stats.length === 0) {
    return {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalViews: 0,
      postsByStatus: { draft: 0, published: 0, archived: 0 },
      postsByCategory: {},
      engagementTrend: [],
      averageEngagement: 0,
    };
  }

  // Calculate statistics
  const totalPosts = stats.length;
  const totalLikes = stats.reduce((sum, post) => sum + (post.likes_count || 0), 0);
  const totalComments = stats.reduce((sum, post) => sum + (post.comments_count || 0), 0);
  const totalViews = stats.reduce((sum, post) => sum + (post.view_count || 0), 0);

  // Posts by status
  const postsByStatus = stats.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Posts by category
  const postsByCategory = stats.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Engagement trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentPosts = stats.filter(post => 
    new Date(post.created_at) >= thirtyDaysAgo
  );

  const engagementTrend = recentPosts.map(post => ({
    date: post.created_at,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    views: post.view_count || 0,
    total: (post.likes_count || 0) + (post.comments_count || 0) + (post.view_count || 0),
  }));

  const averageEngagement = totalPosts > 0 
    ? Math.round((totalLikes + totalComments + totalViews) / totalPosts)
    : 0;

  return {
    totalPosts,
    totalLikes,
    totalComments,
    totalViews,
    postsByStatus: {
      draft: postsByStatus.draft || 0,
      published: postsByStatus.published || 0,
      archived: postsByStatus.archived || 0,
    },
    postsByCategory,
    engagementTrend,
    averageEngagement,
  };
}

/**
 * Update post with validation and analytics tracking
 */
export async function updateUserPost(
  postId: string,
  userId: string,
  updateData: {
    title?: string;
    body?: string;
    category?: CommunityCategory;
    status?: "draft" | "published" | "archived";
    apartment_id?: string;
  }
) {
  const supabase = await createClient();

  // First verify the user owns this post
  const { data: existingPost, error: checkError } = await supabase
    .from("community_posts")
    .select("id, user_id, status")
    .eq("id", postId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (checkError || !existingPost) {
    throw new Error("Post not found or access denied");
  }

  // Prepare update data
  const updatePayload = {
    ...updateData,
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  const { data: updatedPost, error: updateError } = await supabase
    .from("community_posts")
    .update(updatePayload)
    .eq("id", postId)
    .eq("user_id", userId)
    .select(`
      *,
      apartments(id, name, city_id, cities(name, name_ko)),
      community_post_images(id, storage_path, display_order, alt_text, metadata, created_at)
    `)
    .single();

  if (updateError) {
    console.error("updateUserPost error:", updateError);
    throw updateError;
  }

  // Transform with image URLs
  let images: PostImage[] = [];
  if (updatedPost.community_post_images && Array.isArray(updatedPost.community_post_images)) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    images = updatedPost.community_post_images
      .sort((a: PostImage, b: PostImage) => a.display_order - b.display_order)
      .map((image: PostImage) => ({
        ...image,
        post_id: updatedPost.id,
        public_url: createPublicUrl(image.storage_path, supabaseUrl),
      }));
  }

  return {
    ...updatedPost,
    images,
  };
}

/**
 * Delete post (soft delete with cleanup)
 */
export async function deleteUserPost(postId: string, userId: string) {
  const supabase = await createClient();

  // Verify ownership
  const { data: existingPost, error: checkError } = await supabase
    .from("community_posts")
    .select("id, user_id")
    .eq("id", postId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (checkError || !existingPost) {
    throw new Error("Post not found or access denied");
  }

  // Soft delete the post
  const { error: deleteError } = await supabase
    .from("community_posts")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("deleteUserPost error:", deleteError);
    throw deleteError;
  }

  // Optionally clean up associated data (comments, likes)
  // Note: We keep the data for analytics but mark it as associated with deleted post
  
  return { success: true };
}

/**
 * Change post status (draft/published/archived)
 */
export async function changePostStatus(
  postId: string,
  userId: string,
  newStatus: "draft" | "published" | "archived"
) {
  const supabase = await createClient();

  // Verify ownership
  const { data: existingPost, error: checkError } = await supabase
    .from("community_posts")
    .select("id, user_id, status")
    .eq("id", postId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (checkError || !existingPost) {
    throw new Error("Post not found or access denied");
  }

  const { data: updatedPost, error: updateError } = await supabase
    .from("community_posts")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", userId)
    .select("id, status, updated_at")
    .single();

  if (updateError) {
    console.error("changePostStatus error:", updateError);
    throw updateError;
  }

  return updatedPost;
}

/**
 * Get detailed post engagement metrics
 */
export async function getPostEngagementMetrics(postId: string, userId: string) {
  const supabase = await createClient();

  // Verify ownership
  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select(`
      id,
      user_id,
      likes_count,
      comments_count,
      view_count,
      created_at,
      last_activity_at
    `)
    .eq("id", postId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (postError || !post) {
    throw new Error("Post not found or access denied");
  }

  // Get recent likes (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentLikes, error: likesError } = await supabase
    .from("community_likes")
    .select("created_at, profiles(first_name, last_name, avatar_url)")
    .eq("post_id", postId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  if (likesError) {
    console.error("getPostEngagementMetrics likes error:", likesError);
  }

  // Get recent comments
  const { data: recentComments, error: commentsError } = await supabase
    .from("community_comments")
    .select(`
      id,
      content,
      created_at,
      profiles(first_name, last_name, avatar_url)
    `)
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  if (commentsError) {
    console.error("getPostEngagementMetrics comments error:", commentsError);
  }

  // Calculate engagement rate
  const daysSinceCreated = Math.max(
    1,
    Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24))
  );
  
  const totalEngagement = post.likes_count + post.comments_count + post.view_count;
  const engagementRate = totalEngagement / daysSinceCreated;

  return {
    post: {
      id: post.id,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      viewCount: post.view_count,
      createdAt: post.created_at,
      lastActivityAt: post.last_activity_at,
    },
    metrics: {
      totalEngagement,
      engagementRate: Math.round(engagementRate * 100) / 100,
      daysSinceCreated,
    },
    recentLikes: recentLikes || [],
    recentComments: recentComments || [],
  };
}

/**
 * Batch operations for user posts
 */
export async function batchUpdatePostStatus(
  postIds: string[],
  userId: string,
  newStatus: "draft" | "published" | "archived"
) {
  const supabase = await createClient();

  // Verify all posts belong to the user
  const { data: posts, error: checkError } = await supabase
    .from("community_posts")
    .select("id, user_id")
    .in("id", postIds)
    .eq("user_id", userId)
    .eq("is_deleted", false);

  if (checkError || !posts || posts.length !== postIds.length) {
    throw new Error("Some posts not found or access denied");
  }

  const { data: updatedPosts, error: updateError } = await supabase
    .from("community_posts")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .in("id", postIds)
    .eq("user_id", userId)
    .select("id, status, updated_at");

  if (updateError) {
    console.error("batchUpdatePostStatus error:", updateError);
    throw updateError;
  }

  return updatedPosts;
}

/**
 * Get user's post drafts
 */
export async function getUserDrafts(userId: string, limit: number = 10) {
  const supabase = await createClient();

  const { data: drafts, error } = await supabase
    .from("community_posts")
    .select(`
      id,
      title,
      body,
      category,
      apartment_id,
      created_at,
      updated_at,
      apartments(name, city_id, cities(name))
    `)
    .eq("user_id", userId)
    .eq("status", "draft")
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getUserDrafts error:", error);
    throw error;
  }

  return drafts || [];
}

// ============================================================================
// CACHING & OPTIMIZATION FUNCTIONS
// ============================================================================

/**
 * Cached version of getUserPostAnalytics for improved performance
 */
import { unstable_cache } from "next/cache";

export const getCachedUserPostAnalytics = unstable_cache(
  async (userId: string) => {
    return await getUserPostAnalytics(userId);
  },
  ["user-post-analytics"],
  {
    tags: ["user-analytics", "community-posts"],
    revalidate: 300, // 5 minutes cache
  }
);

/**
 * Cached version of getUserPosts for dashboard quick views
 */
export const getCachedUserPostsSummary = unstable_cache(
  async (userId: string, limit: number = 10) => {
    return await getUserPosts({
      userId,
      limit,
      sort: "latest",
    });
  },
  ["user-posts-summary"],
  {
    tags: ["user-posts", "community-posts"],
    revalidate: 60, // 1 minute cache for recent posts
  }
);

/**
 * Get user post permissions for a specific post
 */
export async function getUserPostPermissions(postId: string, userId: string) {
  const supabase = await createClient();

  // Check if user owns the post and get current status
  const { data: post, error } = await supabase
    .from("community_posts")
    .select("id, user_id, status, created_at")
    .eq("id", postId)
    .eq("is_deleted", false)
    .single();

  if (error || !post) {
    return {
      canEdit: false,
      canDelete: false,
      canChangeStatus: false,
      canViewAnalytics: false,
      reasons: ["Post not found"],
    };
  }

  const isOwner = post.user_id === userId;
  const postAge = Date.now() - new Date(post.created_at).getTime();
  const hoursSinceCreated = postAge / (1000 * 60 * 60);

  // Define permission rules
  const permissions = {
    canEdit: isOwner && hoursSinceCreated < 24, // Can edit within 24 hours
    canDelete: isOwner && (post.status === "draft" || hoursSinceCreated < 1), // Can delete drafts or within 1 hour
    canChangeStatus: isOwner,
    canViewAnalytics: isOwner,
    reasons: [] as string[],
  };

  // Add reasons for denied permissions
  if (!isOwner) {
    permissions.reasons.push("Not the post owner");
  } else {
    if (!permissions.canEdit && hoursSinceCreated >= 24) {
      permissions.reasons.push("Edit window expired (24 hours)");
    }
    if (!permissions.canDelete && post.status !== "draft" && hoursSinceCreated >= 1) {
      permissions.reasons.push("Delete window expired (1 hour for published posts)");
    }
  }

  return permissions;
}

/**
 * Get post summary for user dashboard
 */
export async function getUserPostSummaries(
  userId: string,
  params: {
    limit?: number;
    status?: "draft" | "published" | "archived" | "all";
    sort?: "latest" | "popular" | "engagement";
  } = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from("community_posts")
    .select(`
      id,
      title,
      category,
      status,
      likes_count,
      comments_count,
      view_count,
      created_at,
      updated_at,
      last_activity_at,
      apartments(name, cities(name))
    `)
    .eq("user_id", userId)
    .eq("is_deleted", false);

  // Apply filters
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Apply sorting
  switch (params.sort) {
    case "popular":
      query = query.order("likes_count", { ascending: false });
      break;
    case "engagement":
      query = query.order("view_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Apply limit
  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data: posts, error } = await query;
  if (error) {
    console.error("getUserPostSummaries error:", error);
    throw error;
  }

  // Transform to summary format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (posts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    category: post.category,
    status: post.status,
    apartment_name: post.apartments?.name || "Unknown",
    city_name: post.apartments?.cities?.name || "Unknown",
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    view_count: post.view_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
    last_activity_at: post.last_activity_at,
  }));
}

/**
 * Get user engagement summary for quick stats
 */
export async function getUserEngagementSummary(userId: string) {
  const supabase = await createClient();

  // Get recent posts for weekly/monthly calculations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select(`
      id,
      title,
      category,
      likes_count,
      comments_count,
      view_count,
      created_at
    `)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .eq("status", "published");

  if (error) {
    console.error("getUserEngagementSummary error:", error);
    throw error;
  }

  if (!posts || posts.length === 0) {
    return {
      totalEngagement: 0,
      weeklyEngagement: 0,
      monthlyEngagement: 0,
      topPerformingPost: null,
      engagementByCategory: {},
      recentActivity: { likes: 0, comments: 0, views: 0 },
    };
  }

  // Calculate engagement metrics
  const totalEngagement = posts.reduce(
    (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.view_count || 0),
    0
  );

  const weeklyPosts = posts.filter(post => new Date(post.created_at) >= sevenDaysAgo);
  const monthlyPosts = posts.filter(post => new Date(post.created_at) >= thirtyDaysAgo);

  const weeklyEngagement = weeklyPosts.reduce(
    (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.view_count || 0),
    0
  );

  const monthlyEngagement = monthlyPosts.reduce(
    (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.view_count || 0),
    0
  );

  // Find top performing post
  const topPost = posts.reduce((top, current) => {
    const currentEngagement = (current.likes_count || 0) + (current.comments_count || 0) + (current.view_count || 0);
    const topEngagement = top ? (top.likes_count || 0) + (top.comments_count || 0) + (top.view_count || 0) : 0;
    return currentEngagement > topEngagement ? current : top;
  }, null as typeof posts[0] | null);

  const topPerformingPost = topPost ? {
    id: topPost.id,
    title: topPost.title,
    totalEngagement: (topPost.likes_count || 0) + (topPost.comments_count || 0) + (topPost.view_count || 0),
  } : null;

  // Engagement by category
  const engagementByCategory = posts.reduce((acc, post) => {
    const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.view_count || 0);
    acc[post.category] = (acc[post.category] || 0) + engagement;
    return acc;
  }, {} as Record<string, number>);

  // Recent activity (last 7 days)
  const recentActivity = weeklyPosts.reduce(
    (acc, post) => ({
      likes: acc.likes + (post.likes_count || 0),
      comments: acc.comments + (post.comments_count || 0),
      views: acc.views + (post.view_count || 0),
    }),
    { likes: 0, comments: 0, views: 0 }
  );

  return {
    totalEngagement,
    weeklyEngagement,
    monthlyEngagement,
    topPerformingPost,
    engagementByCategory,
    recentActivity,
  };
}

/**
 * Invalidate user post caches when data changes
 */
export async function invalidateUserPostCaches(userId: string, tags?: string[]) {
  const { revalidateTag } = await import("next/cache");
  
  // Default tags to invalidate
  const defaultTags = [
    "user-analytics",
    "user-posts", 
    "community-posts",
    `user-${userId}-posts`,
    `user-${userId}-analytics`,
  ];

  const tagsToInvalidate = tags || defaultTags;
  
  tagsToInvalidate.forEach(tag => {
    revalidateTag(tag);
  });
}

/**
 * Post activity tracking for engagement analytics
 */
export async function trackPostActivity(
  postId: string,
  activityType: "view" | "like" | "comment" | "share",
  userId?: string
) {
  const supabase = await createClient();

  // Update post activity counters
  if (activityType === "view") {
    const { error } = await supabase.rpc("increment_post_views", {
      post_uuid: postId
    });
    
    if (error) {
      console.error("trackPostActivity view error:", error);
    }
  }

  // Update last_activity_at timestamp
  const { error: updateError } = await supabase
    .from("community_posts")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", postId);

  if (updateError) {
    console.error("trackPostActivity timestamp error:", updateError);
  }

  // Optionally log to user_activity table if it exists
  if (userId) {
    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        activity_type: activityType,
        resource_type: "post",
        resource_id: postId,
        metadata: { timestamp: new Date().toISOString() },
      });

    if (activityError) {
      console.error("trackPostActivity user_activity error:", activityError);
    }
  }
}

/**
 * Bulk post operations with optimized queries
 */
export async function bulkGetPostPermissions(postIds: string[], userId: string) {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, user_id, status, created_at")
    .in("id", postIds)
    .eq("is_deleted", false);

  if (error) {
    console.error("bulkGetPostPermissions error:", error);
    throw error;
  }

  return postIds.map(postId => {
    const post = posts?.find(p => p.id === postId);
    if (!post) {
      return {
        postId,
        permissions: {
          canEdit: false,
          canDelete: false,
          canChangeStatus: false,
          canViewAnalytics: false,
          reasons: ["Post not found"],
        },
      };
    }

    const isOwner = post.user_id === userId;
    const postAge = Date.now() - new Date(post.created_at).getTime();
    const hoursSinceCreated = postAge / (1000 * 60 * 60);

    return {
      postId,
      permissions: {
        canEdit: isOwner && hoursSinceCreated < 24,
        canDelete: isOwner && (post.status === "draft" || hoursSinceCreated < 1),
        canChangeStatus: isOwner,
        canViewAnalytics: isOwner,
        reasons: isOwner ? [] : ["Not the post owner"],
      },
    };
  });
}
