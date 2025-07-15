import { NextRequest, NextResponse } from 'next/server';
import { createComment } from '@/lib/data/community';
import { createCommentSchema } from '@/lib/validation/community';
import { createClient } from '@/lib/supabase/server';

// POST: 댓글/대댓글 작성
export async function POST(
  req: NextRequest,
  context: { params: { postId: string } },
) {
  const { params } = context;
  try {
    // SSR 인증: 로그인 사용자만 허용
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
    }
    const postId = params.postId;
    if (!postId) {
      return NextResponse.json({ success: false, message: '게시글 정보가 올바르지 않습니다.' }, { status: 400 });
    }
    // request body 파싱 및 Zod validation
    const body = await req.json();
    const parsed = createCommentSchema.safeParse({ ...body, post_id: postId });
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || '입력값이 올바르지 않습니다.' }, { status: 400 });
    }
    // createComment 호출
    const comment = await createComment({ ...parsed.data, user_id: user.id });
    return NextResponse.json({ success: true, data: comment });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '댓글 작성에 실패했습니다.' }, { status: 500 });
  }
}
