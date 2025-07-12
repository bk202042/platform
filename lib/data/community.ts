import { CommunityCategory } from '../validation/community';
import { createClient } from '../supabase/server';

// 게시글 목록 조회
export async function getPosts(params: {
  city?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  sort?: 'popular' | 'latest';
}) {
  const supabase = await createClient();
  let query = supabase
    .from('community_posts')
    .select(`*, apartments(city_id, name, slug, cities(name))`) // join apartments for city filter
    .eq('is_deleted', false);

  if (params.apartmentId) {
    query = query.eq('apartment_id', params.apartmentId);
  }
  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.city) {
    query = query.eq('apartments.city_id', params.city);
  }

  // 인기글: 7일 내 좋아요순 상단, 나머지 최신순
  if (params.sort === 'popular') {
    // 7일 내 글 중 좋아요순 정렬
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.gte('created_at', sevenDaysAgo.toISOString()).order('likes_count', { ascending: false });
  } else {
    // 최신순
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// 게시글 상세 조회
export async function getPostById(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, apartments(city_id, name, slug, cities(name))')
    .eq('id', postId)
    .eq('is_deleted', false)
    .single();
  if (error) {
    console.error('getPostById error:', error);
    return null;
  }
  return data;
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
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from('community_posts')
    .insert([
      {
        apartment_id: data.apartment_id,
        category: data.category,
        title: data.title,
        body: data.body,
        images: data.images ?? [],
        user_id: data.user_id,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return post;
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
    .from('community_comments')
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
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  if (selectError && selectError.code !== 'PGRST116') throw selectError;

  if (existing) {
    // 이미 좋아요가 있으면 삭제
    const { error: deleteError } = await supabase
      .from('community_likes')
      .delete()
      .eq('id', existing.id);
    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    // 없으면 추가
    const { error: insertError } = await supabase
      .from('community_likes')
      .insert([{ post_id: postId, user_id: userId }]);
    if (insertError) throw insertError;
    return { liked: true };
  }
}

// 도시 목록 조회
export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('cities').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// 아파트 목록 조회 (도시 이름 포함)
export async function getApartments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('apartments')
    .select('id, name, city_id, cities(name)')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}
