import { CommunityCategory } from '../validation/community';
import { createClient } from '../supabase/server';
import { Comment } from '@/components/community/CommentSection';

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

// 게시글 상세 조회 (사용자 좋아요 상태 포함)
export async function getPostByIdWithLikeStatus(postId: string, userId?: string) {
  const supabase = await createClient();

  // Get post data
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('*, apartments(city_id, name, slug, cities(name))')
    .eq('id', postId)
    .eq('is_deleted', false)
    .single();

  if (postError) {
    console.error('getPostByIdWithLikeStatus error:', postError);
    return null;
  }

  // Get user's like status if user is provided
  let isLiked = false;
  if (userId) {
    const { data: likeData } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    isLiked = !!likeData;
  }

  return {
    ...post,
    isLiked
  };
}

// 게시글 목록 조회 (사용자 좋아요 상태 포함)
export async function getPostsWithLikeStatus(params: {
  city?: string;
  apartmentId?: string;
  category?: CommunityCategory;
  sort?: 'popular' | 'latest';
  userId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('community_posts')
    .select(`*, apartments(city_id, name, slug, cities(name))`)
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.gte('created_at', sevenDaysAgo.toISOString()).order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: posts, error } = await query;
  if (error) throw error;

  // Get user's like status for all posts if user is provided
  if (params.userId && posts) {
    const postIds = posts.map(post => post.id);
    const { data: likes } = await supabase
      .from('community_likes')
      .select('post_id')
      .eq('user_id', params.userId)
      .in('post_id', postIds);

    const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

    return posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post.id)
    }));
  }

  return posts?.map(post => ({ ...post, isLiked: false })) || [];
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

// 댓글 목록 조회
export async function getComments(postId: string) {
  const supabase = await createClient();

  // First get comments with user IDs
  const { data: commentsData, error } = await supabase
    .from('community_comments')
    .select(`
      id,
      content,
      created_at,
      parent_id,
      user_id
    `)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getComments error:', error);
    return [];
  }

  if (!commentsData || commentsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

  // Get user data from auth.users
  const { data: usersData, error: usersError } = await supabase
    .from('auth.users')
    .select('id, raw_user_meta_data')
    .in('id', userIds);

  if (usersError) {
    console.error('getComments users error:', usersError);
  }

  // Create user lookup map
  const userMap = new Map();
  usersData?.forEach(user => {
    const fullName = user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || '익명';
    userMap.set(user.id, fullName);
  });

  // Transform data to match Comment interface and build hierarchy
  const comments = commentsData.map(comment => ({
    id: comment.id,
    body: comment.content,
    user: {
      name: userMap.get(comment.user_id) || '익명'
    },
    created_at: comment.created_at,
    parent_id: comment.parent_id,
    user_id: comment.user_id, // Include user_id for ownership validation
    children: [] as Comment[]
  }));

  // Build comment hierarchy
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, comment);
  });

  // Second pass: build hierarchy
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent && parent.children) {
        parent.children.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
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

// 카테고리별 게시글 수 조회
export async function getPostCountsByCategory(params?: {
  city?: string;
  apartmentId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('community_posts')
    .select('category, apartments(city_id)', { count: 'exact' })
    .eq('is_deleted', false);

  if (params?.apartmentId) {
    query = query.eq('apartment_id', params.apartmentId);
  }
  if (params?.city) {
    query = query.eq('apartments.city_id', params.city);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Count posts by category
  const counts: Record<string, number> = {};
  let totalCount = 0;

  data?.forEach((post) => {
    const category = post.category;
    counts[category] = (counts[category] || 0) + 1;
    totalCount++;
  });

  return {
    total: totalCount,
    byCategory: counts
  };
}
