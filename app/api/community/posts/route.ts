import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/data/community';
import { COMMUNITY_CATEGORIES, createPostSchema } from '@/lib/validation/community';
import { createClient } from '@/lib/supabase/server';

// Type guard for COMMUNITY_CATEGORIES
function isCommunityCategory(value: string): value is typeof COMMUNITY_CATEGORIES[number] {
  return COMMUNITY_CATEGORIES.includes(value as typeof COMMUNITY_CATEGORIES[number]);
}

// GET: 게시글 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || undefined;
    const apartmentId = searchParams.get('apartmentId') || undefined;
    const categoryParam = searchParams.get('category');
    const sort = searchParams.get('sort') as 'popular' | 'latest' | undefined;

    // category 파라미터를 ENUM으로 변환
    const category =
      categoryParam && isCommunityCategory(categoryParam)
        ? categoryParam
        : undefined;

    const posts = await getPosts({
      city,
      apartmentId,
      category,
      sort,
    });
    return NextResponse.json({ success: true, data: posts });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '게시글 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

// POST: 게시글 생성
export async function POST(req: NextRequest) {
  try {
    // SSR 인증: 로그인 사용자만 허용
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
    }

    // request body 파싱 및 Zod validation
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message || '입력값이 올바르지 않습니다.' }, { status: 400 });
    }

    // createPost 호출
    const post = await createPost({ ...parsed.data, user_id: user.id });
    return NextResponse.json({ success: true, data: post });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, message: '게시글 작성에 실패했습니다.' }, { status: 500 });
  }
}
