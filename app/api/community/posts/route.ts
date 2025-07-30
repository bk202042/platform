import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";
import { createPostSchema } from "@/lib/validation/community";
import { createServerClient } from "@supabase/ssr";
import { processUploadedImages, createPublicUrl } from "@/lib/utils/community-images";
import { PostImage } from "@/lib/types/community";

/**
 * Transforms raw community_post_images data into PostImage format with public URLs
 */
interface RawPostImage {
  id: string;
  post_id: string;
  storage_path: string;
  display_order: number;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

function transformPostImages(rawImages: unknown[]): PostImage[] {
  if (!rawImages || rawImages.length === 0) return [];
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  return (rawImages as RawPostImage[])
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => ({
      id: image.id,
      post_id: image.post_id,
      storage_path: image.storage_path,
      display_order: image.display_order,
      alt_text: image.alt_text || undefined,
      metadata: image.metadata || {},
      created_at: image.created_at,
      // Generate public URL for frontend use
      public_url: createPublicUrl(image.storage_path, supabaseUrl),
    }));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city") || undefined;
    const apartmentId = searchParams.get("apartmentId") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || "latest";
    const userId = searchParams.get("userId") || undefined;

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 게시글 목록 조회 쿼리 구성
    let query = supabase
      .from("community_posts")
      .select(`*, apartments(city_id, name, slug, cities(name)), community_post_images(id, storage_path, display_order, alt_text, metadata, created_at)`)
      .eq("is_deleted", false);

    if (apartmentId) {
      query = query.eq("apartment_id", apartmentId);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (city) {
      query = query.eq("apartments.city_id", city);
    }

    // 정렬 방식 적용
    if (sort === "popular") {
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

    // 쿼리 실행
    const { data: posts, error } = await query;

    if (error) {
      console.error("Posts fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // 사용자 좋아요 상태 확인
    if (userId && posts && posts.length > 0) {
      const postIds = posts.map((post) => post.id);
      const { data: likes } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds);

      const likedPostIds = new Set(likes?.map((like) => like.post_id) || []);

      // 좋아요 상태 추가 및 이미지 변환
      const postsWithLikeStatus = posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        images: transformPostImages(post.community_post_images || []),
      }));

      return NextResponse.json(postsWithLikeStatus);
    }

    // 좋아요 상태 없이 반환 및 이미지 변환
    return NextResponse.json(
      posts?.map((post) => ({ 
        ...post, 
        isLiked: false,
        images: transformPostImages(post.community_post_images || []),
      })) || []
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 스키마 검증
    const result = createPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 인증된 사용자 확인
    const {
      data: claims,
      error: authError,
    } = await supabase.auth.getClaims();

    if (authError || !claims || !claims.claims || !claims.claims.sub) {
      console.error("Auth error in create post API:", authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.log(`User ${claims.claims.sub} is attempting to create a post.`);
    
    // Debug: Check auth.uid() context in database
    try {
      const { data: authUidTest } = await supabase.rpc('auth_uid_debug');
      console.log('Database auth.uid() result:', authUidTest);
    } catch (dbError) {
      console.log('Database auth check failed:', dbError);
    }

    // Debug: Check if auth.uid() is available in database context
    try {
      const { data: debugAuth } = await supabase.rpc('get_auth_uid');
      console.log('Database auth.uid() context:', debugAuth);
      
      const { data: debugRLS } = await supabase.rpc('debug_rls_context');
      console.log('RLS context debug:', debugRLS);
    } catch (debugError) {
      console.log('Debug auth check failed:', debugError);
    }

    // 게시글 생성 - Use service role to bypass RLS since auth.uid() is null in server context
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {}, 
        },
      }
    );

    const { data: post, error: insertError } = await serviceSupabase
      .from("community_posts")
      .insert([
        {
          apartment_id: result.data.apartment_id,
          category: result.data.category,
          title: result.data.title,
          body: result.data.body,
          user_id: claims.claims.sub, // We validated this user is authenticated above
          status: "published",
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Enhanced error logging for debugging
      const errorCode = insertError.code || 'unknown';
      const errorMessage = insertError.message || 'Unknown error';
      const errorDetails = insertError.details || 'No details available';
      
      console.error(`ERROR|/api/community/posts|POST|${errorCode}|${errorMessage}|${errorDetails}`);
      console.error("Full Supabase error object:", JSON.stringify(insertError, null, 2));
      
      // Categorize errors for better user feedback
      let userMessage = "Failed to create post";
      let statusCode = 500;
      
      switch (errorCode) {
        case '23503': // Foreign key violation
          console.error(`ERROR|FK_VIOLATION|apartment_id=${result.data.apartment_id}|user_id=${claims.claims.sub}`);
          userMessage = "Invalid apartment selection. Please try again.";
          statusCode = 400;
          break;
        case '23502': // Not null violation  
          console.error(`ERROR|NULL_VIOLATION|missing_required_field|${errorDetails}`);
          userMessage = "Missing required information. Please check all fields.";
          statusCode = 400;
          break;
        case '23505': // Unique violation
          console.error(`ERROR|UNIQUE_VIOLATION|duplicate_entry|${errorDetails}`);
          userMessage = "Duplicate post detected. Please refresh and try again.";
          statusCode = 409;
          break;
        case 'PGRST301': // RLS policy violation
          console.error(`ERROR|RLS_VIOLATION|user_id=${claims.claims.sub}|apartment_id=${result.data.apartment_id}`);
          userMessage = "Permission denied. Please check your account status.";
          statusCode = 403;
          break;
        case '08P01': // Connection error
          console.error(`ERROR|DB_CONNECTION|network_timeout|${errorMessage}`);
          userMessage = "Database connection error. Please try again.";
          statusCode = 503;
          break;
        default:
          console.error(`ERROR|UNKNOWN_DB_ERROR|code=${errorCode}|user_id=${claims.claims.sub}`);
          userMessage = `Database error (${errorCode}). Please try again or contact support.`;
          statusCode = 500;
      }
      
      return NextResponse.json(
        { 
          error: userMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID()
        },
        { status: statusCode }
      );
    }

    // Process and insert images if provided
    if (result.data.images && result.data.images.length > 0) {
      try {
        console.log(`INFO|/api/community/posts|POST|processing_images|post_id=${post.id}|image_count=${result.data.images.length}`);
        console.log('Raw image URLs:', result.data.images);
        
        const imageData = processUploadedImages(result.data.images);
        console.log('Processed image data:', imageData);
        
        // Insert image records
        const imageRecords = imageData.map(image => ({
          post_id: post.id,
          storage_path: image.storage_path,
          display_order: image.display_order,
          alt_text: image.alt_text || undefined,
          metadata: image.metadata || {},
        }));
        
        console.log('Image records for insertion:', imageRecords);

        const { error: imageInsertError } = await serviceSupabase
          .from("community_post_images")
          .insert(imageRecords);

        if (imageInsertError) {
          // Enhanced error logging for image insertion failures
          const errorCode = imageInsertError.code || 'unknown';
          const errorMessage = imageInsertError.message || 'Unknown error';
          const errorDetails = imageInsertError.details || 'No details available';
          
          console.error(`ERROR|/api/community/posts|POST|image_insert_failed|${errorCode}|${errorMessage}|${errorDetails}|post_id=${post.id}`);
          console.error("Full image insertion error object:", JSON.stringify(imageInsertError, null, 2));
          console.error("Image records that failed:", JSON.stringify(imageRecords, null, 2));
          
          // Categorize image-specific errors
          if (errorCode === '23514') { // Check constraint violation
            console.error(`ERROR|IMAGE_CONSTRAINT_VIOLATION|storage_paths=${imageRecords.map(r => r.storage_path).join(',')}`);
          } else if (errorCode === '23503') { // Foreign key violation
            console.error(`ERROR|IMAGE_FK_VIOLATION|post_id=${post.id}|might_be_deleted`);
          }
          
          // Note: We don't fail the entire request if images fail to insert
          // The post was already created successfully, but we should log this prominently
          console.warn(`WARNING|/api/community/posts|POST|post_created_without_images|post_id=${post.id}|reason=image_insertion_failed`);
        } else {
          console.log(`SUCCESS|/api/community/posts|POST|images_inserted|post_id=${post.id}|image_count=${imageRecords.length}`);
        }
      } catch (imageError) {
        // Enhanced error logging for image processing failures
        const errorMessage = imageError instanceof Error ? imageError.message : String(imageError);
        console.error(`ERROR|/api/community/posts|POST|image_processing_failed|${errorMessage}|post_id=${post.id}`);
        console.error("Full image processing error:", imageError);
        console.error("Raw image URLs that failed processing:", result.data.images);
        
        // Continue without failing the request but log prominently
        console.warn(`WARNING|/api/community/posts|POST|post_created_without_images|post_id=${post.id}|reason=image_processing_failed`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
