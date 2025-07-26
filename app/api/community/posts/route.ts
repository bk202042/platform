import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";
import { createPostSchema } from "@/lib/validation/community";

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
      .select(`*, apartments(city_id, name, slug, cities(name))`)
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

      // 좋아요 상태 추가
      const postsWithLikeStatus = posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));

      return NextResponse.json(postsWithLikeStatus);
    }

    // 좋아요 상태 없이 반환
    return NextResponse.json(
      posts?.map((post) => ({ ...post, isLiked: false })) || []
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

    // 게시글 생성
    const { data: post, error: insertError } = await supabase
      .from("community_posts")
      .insert([
        {
          apartment_id: result.data.apartment_id,
          category: result.data.category,
          title: result.data.title,
          body: result.data.body,
          images: result.data.images ?? [],
          user_id: claims.claims.sub,
          status: "published", // Add the missing status field
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase post creation error:", insertError);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
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
