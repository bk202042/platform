import { NextRequest, NextResponse } from 'next/server';
import { toggleLike } from '@/lib/data/community';
import { createClient } from '@/lib/supabase/server';

// POST: 좋아요 토글
export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const postId = pathname.split('/')[4];
    // SSR 인증: 로그인 사용자만 허용
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
    }
    if (!postId) {
      return NextResponse.json({ success: false, message: '게시글 정보가 올바르지 않습니다.' }, { status: 400 });
    }
    const result = await toggleLike(postId, user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '좋아요 처리에 실패했습니다.' }, { status: 500 });
  }
}
