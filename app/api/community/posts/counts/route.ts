import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city") || undefined;
    const apartmentId = searchParams.get("apartmentId") || undefined;

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 카테고리별 게시글 수 조회 쿼리 구성
    let query = supabase
      .from("community_posts")
      .select("category, apartments(city_id)", { count: "exact" })
      .eq("is_deleted", false);

    if (apartmentId) {
      query = query.eq("apartment_id", apartmentId);
    }

    if (city) {
      query = query.eq("apartments.city_id", city);
    }

    // 쿼리 실행
    const { data, error, count } = await query;

    if (error) {
      console.error("Post counts error:", error);
      return NextResponse.json(
        { error: "Failed to fetch post counts" },
        { status: 500 }
      );
    }

    // 카테고리별 게시글 수 계산
    const counts: Record<string, number> = {};
    data?.forEach((post) => {
      const category = post.category;
      counts[category] = (counts[category] || 0) + 1;
    });

    return NextResponse.json({
      total: count || 0,
      byCategory: counts,
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
