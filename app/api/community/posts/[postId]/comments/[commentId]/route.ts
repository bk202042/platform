import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE: 댓글 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> },
) {
  try {
    // SSR 인증: 로그인 사용자만 허용
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    const { postId, commentId } = await params;

    if (!postId || !commentId) {
      return NextResponse.json({
        success: false,
        message: '게시글 또는 댓글 정보가 올바르지 않습니다.'
      }, { status: 400 });
    }

    // 댓글 존재 여부 및 소유권 확인
    const { data: comment, error: selectError } = await supabase
      .from('community_comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single();

    if (selectError || !comment) {
      return NextResponse.json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 댓글 소유자인지 확인
    if (comment.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        message: '댓글을 삭제할 권한이 없습니다.'
      }, { status: 403 });
    }

    // 댓글 삭제 (CASCADE로 대댓글도 함께 삭제됨)
    const { error: deleteError } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Comment deletion error:', deleteError);
      return NextResponse.json({
        success: false,
        message: '댓글 삭제에 실패했습니다.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error: unknown) {
    console.error('DELETE comment error:', error);
    return NextResponse.json({
      success: false,
      message: '댓글 삭제에 실패했습니다.'
    }, { status: 500 });
  }
}
