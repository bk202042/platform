import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-api";
import { updatePostSchema } from "@/lib/validation/community";
import { updateUserPost } from "@/lib/data/community";

export const runtime = 'nodejs';

// 게시글 삭제 API
export async function DELETE(request: NextRequest) {
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

    // 게시글 조회
    const { data: post, error: selectError } = await supabase
      .from("community_posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (selectError) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 작성자 확인 (관리자는 모든 게시글 삭제 가능)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.claims.sub)
      .single();

    const isAdmin = profile?.role === "admin";

    if (post.user_id !== claims.claims.sub && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    // 소프트 삭제 (is_deleted 플래그 설정)
    const { error: updateError } = await supabase
      .from("community_posts")
      .update({ is_deleted: true })
      .eq("id", postId);

    if (updateError) {
      console.error("Post deletion error:", updateError);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 게시글 업데이트 API
export async function PUT(request: NextRequest) {
  // URL에서 postId 추출
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const postId = pathParts[pathParts.length - 2];

  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 게시글 수정 스키마 검증
    const result = updatePostSchema.safeParse(body);
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 게시글 존재 및 권한 확인
    const { data: existingPost, error: selectError } = await supabase
      .from("community_posts")
      .select("user_id, created_at")
      .eq("id", postId)
      .eq("is_deleted", false)
      .single();

    if (selectError || !existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 작성자 확인
    if (existingPost.user_id !== claims.claims.sub) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }

    // Edit time limit removed - users can edit posts at any time

    // 게시글 업데이트
    try {
      const updatedPost = await updateUserPost(
        postId,
        claims.claims.sub,
        result.data
      );

      return NextResponse.json({
        success: true,
        data: updatedPost,
      });
    } catch (updateError) {
      console.error("Post update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
