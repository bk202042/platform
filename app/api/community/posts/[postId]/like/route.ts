import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";

// 좋아요 토글 API
export async function POST(request: NextRequest) {
  // URL에서 postId 추출
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const postId = pathParts[pathParts.length - 2]; // URL 경로에서 postId 추출
  try {
    // postId는 이미 URL에서 추출됨

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 인증된 사용자 확인
    const {
      data: claims,
      error: authError,
    } = await supabase.auth.getClaims();

    if (authError || !claims || !claims.claims || !claims.claims.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 좋아요 존재 여부 확인
    const { data: existing, error: selectError } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", claims.claims.sub)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Like check error:", selectError);
      return NextResponse.json(
        { error: "Failed to check like status" },
        { status: 500 }
      );
    }

    let liked = false;

    if (existing) {
      // 이미 좋아요가 있으면 삭제
      const { error: deleteError } = await supabase
        .from("community_likes")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("Like deletion error:", deleteError);
        return NextResponse.json(
          { error: "Failed to remove like" },
          { status: 500 }
        );
      }

      liked = false;
    } else {
      // 없으면 추가
      const { error: insertError } = await supabase
        .from("community_likes")
        .insert([{ post_id: postId, user_id: claims.claims.sub }]);

      if (insertError) {
        console.error("Like insertion error:", insertError);
        return NextResponse.json(
          { error: "Failed to add like" },
          { status: 500 }
        );
      }

      liked = true;
    }

    // 좋아요 수 업데이트
    await supabase.rpc("update_post_likes_count", { post_id: postId });

    // 현재 좋아요 수 조회
    const { data: post } = await supabase
      .from("community_posts")
      .select("likes_count")
      .eq("id", postId)
      .single();

    return NextResponse.json({
      liked,
      count: post?.likes_count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
