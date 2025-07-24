# Enhanced Community Feature Implementation Plan for Korean Expatriate Platform

This implementation plan provides a comprehensive approach to building a modern, performant community feature for a Vietnamese real estate platform targeting Korean expatriates. The plan incorporates Next.js App Router, React Server Components, Supabase, and modern data fetching patterns.

## 1. Core Architecture Analysis

### Navigation Flow
- **Location-based Content**: Posts filtered by apartment/city (e.g., "호치민", "빈홈 센트럴 파크")
- **Category-based Filtering**: Posts organized by categories (QNA, RECOMMEND, SECONDHAND, FREE)
- **Post Detail View**: Individual post pages with unique URLs containing slugified titles and UUIDs

### Component Structure
- **Server Components**: Handle data fetching and initial rendering
- **Client Components**: Handle interactivity and state management
- **Suspense Boundaries**: Enable streaming and progressive rendering
- **Error Boundaries**: Gracefully handle errors at component level

### Routing Strategy
- **Main Community Page**: `/community` with filters
- **Post Detail Pages**: `/community/[post-slug]-[post-id]` with unique identifiers
- **Category Pages**: `/community?category=[category-name]`
- **Location-based Pages**: `/community?apartment=[apartment-id]`

### State Management
- **Server Actions**: For mutations (create, update, delete)
- **React Server Components**: For initial data fetching
- **Optimistic UI Updates**: For likes, comments, and post creation
- **Suspense & Streaming**: For progressive loading and improved UX

### Styling Methodology
- **Tailwind CSS**: Utility-first styling with shadcn/ui components
- **Mobile-first Responsive Design**: Adapts to different screen sizes
- **Korean Typography**: Noto Sans KR font for proper Korean text rendering
- **Visual Indicators**: For post categories, locations, and interaction counts

## 2. Implementation Plan

### Phase 1: Database Schema & Server-Side Data Layer

#### Database Schema

```sql
-- Community Posts Table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  apartment_id TEXT REFERENCES apartments(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('QNA', 'RECOMMEND', 'SECONDHAND', 'FREE')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Comments Table
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES community_comments(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Post Likes Table
CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Community Post Images Table
CREATE TABLE community_post_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT max_images_per_post CHECK (
    (SELECT COUNT(*) FROM community_post_images WHERE post_id = post_id) <= 5
  )
);
```

#### Row Level Security (RLS) Policies

```sql
-- Enable RLS on community tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_images ENABLE ROW LEVEL SECURITY;

-- Community Posts Policies
CREATE POLICY "Public can view published non-deleted posts"
ON community_posts FOR SELECT
USING (status = 'published' AND is_deleted = false);

CREATE POLICY "Users can create posts"
ON community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON community_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON community_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for comments, likes, and images
```

#### Database Triggers

```sql
-- Trigger to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON community_post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Similar triggers for comments count
```

#### Server-Side Data Layer (`lib/data/community.ts`)

```typescript
// lib/data/community.ts
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { type Post, type Comment, type Category, type Apartment } from '@/lib/types';

// Get community categories (cached)
export const getCommunityCategories = cache(async (): Promise<Category[]> => {
  // In a real implementation, these would come from the database
  return [
    { id: 'QNA', name: 'Q&A', name_ko: '질문과 답변', slug: 'qna' },
    { id: 'RECOMMEND', name: 'Recommendations', name_ko: '추천', slug: 'recommend' },
    { id: 'SECONDHAND', name: 'Secondhand', name_ko: '중고거래', slug: 'secondhand' },
    { id: 'FREE', name: 'Free', name_ko: '자유게시판', slug: 'free' }
  ];
});

// Get apartments (cached)
export const getApartments = cache(async (): Promise<Apartment[]> => {
  const supabase = createServerClient(cookies());
  const { data, error } = await supabase
    .from('apartments')
    .select('id, name, city_id, slug')
    .order('name');

  if (error) throw new Error(`Failed to fetch apartments: ${error.message}`);
  return data || [];
});

// Get community posts with pagination and filters
export const getCommunityPosts = cache(async ({
  category,
  apartmentId,
  page = 1,
  limit = 10
}: {
  category?: string;
  apartmentId?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: Post[]; total: number }> => {
  const supabase = createServerClient(cookies());

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name, avatar_url),
      apartment:apartment_id(id, name, city_id)
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category.toUpperCase());
  }

  if (apartmentId) {
    query = query.eq('apartment_id', apartmentId);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch posts: ${error.message}`);

  return {
    posts: data || [],
    total: count || 0
  };
});

// Get single post by ID
export const getCommunityPost = cache(async (postId: string): Promise<Post> => {
  const supabase = createServerClient(cookies());

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name, avatar_url),
      apartment:apartment_id(id, name, city_id),
      images:community_post_images(id, storage_path, order_index)
    `)
    .eq('id', postId)
    .eq('is_deleted', false)
    .single();

  if (error || !data) {
    notFound();
  }

  // Increment view count
  await supabase.rpc('increment_post_view', { post_id: postId });

  return data;
});

// Get comments for a post
export const getPostComments = cache(async (postId: string): Promise<Comment[]> => {
  const supabase = createServerClient(cookies());

  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      user:user_id(id, email, first_name, last_name, avatar_url)
    `)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch comments: ${error.message}`);

  return data || [];
});

// Check if current user has liked a post
export const hasUserLikedPost = cache(async (postId: string): Promise<boolean> => {
  const supabase = createServerClient(cookies());

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return false;

  const { data, error } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', session.session.user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to check like status: ${error.message}`);

  return !!data;
});
```

### Phase 2: Server Actions for Mutations

#### Action Helpers (`lib/action-helpers.ts`)

```typescript
// lib/action-helpers.ts
import { z } from "zod";
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Standard state for actions
export type ActionState = {
  error?: string;
  success?: string;
  data?: any;
};

// Core logic for a validated action
type ValidatedActionFunction<S extends z.ZodType<any, any>, R extends ActionState> = (
  data: z.infer<S>,
  formData: FormData,
  supabase: ReturnType<typeof createServerClient>
) => Promise<R>;

// Wraps an action with Zod schema validation
export function validatedAction<S extends z.ZodType<any, any>, R extends ActionState>(
  schema: S,
  action: ValidatedActionFunction<S, R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    const supabase = createServerClient(cookies());

    // Parse form data
    const parsedForm = Object.fromEntries(formData.entries());
    const result = schema.safeParse(parsedForm);

    if (!result.success) {
      return { error: result.error.errors[0].message } as R;
    }

    return action(result.data, formData, supabase);
  };
}

// Core logic for a validated action requiring an authenticated user
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, R extends ActionState> = (
  data: z.infer<S>,
  formData: FormData,
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) => Promise<R>;

// Wraps an action with authentication and Zod schema validation
export function validatedActionWithUser<S extends z.ZodType<any, any>, R extends ActionState>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, R>
) {
  return async (prevState: R, formData: FormData): Promise<R> => {
    const supabase = createServerClient(cookies());

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { error: "로그인이 필요합니다." } as R;
    }

    // Parse form data
    const parsedForm = Object.fromEntries(formData.entries());
    const result = schema.safeParse(parsedForm);

    if (!result.success) {
      return { error: result.error.errors[0].message } as R;
    }

    return action(result.data, formData, supabase, session.user.id);
  };
}
```

#### Community Actions (`app/actions/community.ts`)

```typescript
// app/actions/community.ts
"use server";

import { z } from "zod";
import { validatedActionWithUser, type ActionState } from "@/lib/action-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Create Post Schema
const createPostSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다.").max(100, "제목은 최대 100자까지 가능합니다."),
  content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다.").max(10000, "내용은 최대 10000자까지 가능합니다."),
  category: z.enum(["QNA", "RECOMMEND", "SECONDHAND", "FREE"]),
  apartmentId: z.string().min(1, "아파트를 선택해주세요."),
});

// Create Post Action
export const createPost = validatedActionWithUser(
  createPostSchema,
  async (data, formData, supabase, userId): Promise<ActionState> => {
    try {
      // Insert post
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
          apartment_id: data.apartmentId,
          user_id: userId,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Handle image uploads if any
      const imageFiles = formData.getAll('images') as File[];
      if (imageFiles.length > 0) {
        // Upload images to Supabase Storage
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const filePath = `community/${post.id}/${i}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('community-images')
            .upload(filePath, file);

          if (uploadError) throw new Error(uploadError.message);

          // Add image reference to database
          const { error: imageError } = await supabase
            .from('community_post_images')
            .insert({
              post_id: post.id,
              storage_path: filePath,
              order_index: i
            });

          if (imageError) throw new Error(imageError.message);
        }
      }

      // Create slug from title
      const slug = post.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      revalidatePath('/community');
      redirect(`/community/${slug}-${post.id}`);
    } catch (error: any) {
      return { error: `게시글 작성에 실패했습니다: ${error.message}` };
    }
  }
);

// Create Comment Schema
const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1, "댓글 내용을 입력해주세요.").max(1000, "댓글은 최대 1000자까지 가능합니다."),
  parentId: z.string().uuid().optional(),
});

// Create Comment Action
export const createComment = validatedActionWithUser(
  createCommentSchema,
  async (data, formData, supabase, userId): Promise<ActionState> => {
    try {
      const { data: comment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: data.postId,
          content: data.content,
          parent_id: data.parentId,
          user_id: userId
        })
        .select(`
          *,
          user:user_id(id, email, first_name, last_name, avatar_url)
        `)
        .single();

      if (error) throw new Error(error.message);

      revalidatePath(`/community/${data.postId}`);
      return {
        success: "댓글이 작성되었습니다.",
        data: comment
      };
    } catch (error: any) {
      return { error: `댓글 작성에 실패했습니다: ${error.message}` };
    }
  }
);

// Toggle Like Schema
const toggleLikeSchema = z.object({
  postId: z.string().uuid()
});

// Toggle Like Action
export const toggleLike = validatedActionWithUser(
  toggleLikeSchema,
  async (data, formData, supabase, userId): Promise<ActionState> => {
    try {
      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('community_post_likes')
        .select()
        .eq('post_id', data.postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', data.postId)
          .eq('user_id', userId);

        if (error) throw new Error(error.message);

        return {
          success: "좋아요가 취소되었습니다.",
          data: { liked: false }
        };
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: data.postId,
            user_id: userId
          });

        if (error) throw new Error(error.message);

        return {
          success: "좋아요가 추가되었습니다.",
          data: { liked: true }
        };
      }
    } catch (error: any) {
      return { error: `좋아요 처리에 실패했습니다: ${error.message}` };
    }
  }
);

// Delete Comment Schema
const deleteCommentSchema = z.object({
  commentId: z.string().uuid()
});

// Delete Comment Action
export const deleteComment = validatedActionWithUser(
  deleteCommentSchema,
  async (data, formData, supabase, userId): Promise<ActionState> => {
    try {
      // Verify ownership
      const { data: comment } = await supabase
        .from('community_comments')
        .select()
        .eq('id', data.commentId)
        .eq('user_id', userId)
        .single();

      if (!comment) {
        return { error: "댓글을 삭제할 권한이 없습니다." };
      }

      // Soft delete
      const { error } = await supabase
        .from('community_comments')
        .update({ is_deleted: true })
        .eq('id', data.commentId);

      if (error) throw new Error(error.message);

      revalidatePath(`/community/${comment.post_id}`);
      return { success: "댓글이 삭제되었습니다." };
    } catch (error: any) {
      return { error: `댓글 삭제에 실패했습니다: ${error.message}` };
    }
  }
);
```

### Phase 3: Server Components & Client Components

#### Community Page (`app/community/page.tsx`)

```tsx
// app/community/page.tsx
import { Suspense } from 'react';
import { getCommunityCategories, getApartments, getCommunityPosts } from '@/lib/data/community';
import CommunityPageClient from './_components/CommunityPageClient';
import CategorySidebar from './_components/CategorySidebar';
import PostCardSkeleton from '@/components/community/PostCardSkeleton';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function CommunityPage({
  searchParams
}: {
  searchParams: { category?: string; apartment?: string; page?: string }
}) {
  // Fetch data in parallel
  const categoriesPromise = getCommunityCategories();
  const apartmentsPromise = getApartments();
  const postsPromise = getCommunityPosts({
    category: searchParams.category,
    apartmentId: searchParams.apartment,
    page: searchParams.page ? parseInt(searchParams.page) : 1
  });

  // Get current user for auth-dependent UI
  const supabase = createServerClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Wait for sidebar data
  const [categories, apartments] = await Promise.all([
    categoriesPromise,
    apartmentsPromise
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">커뮤니티 (Community)</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <CategorySidebar
            categories={categories}
            activeCategory={searchParams.category}
            apartments={apartments}
            activeApartment={searchParams.apartment}
            currentUserId={currentUserId}
          />
        </div>

        <div className="w-full md:w-3/4">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          }>
            <CommunityPageClient
              postsPromise={postsPromise}
              currentUserId={currentUserId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

#### Community Page Client (`app/community/_components/CommunityPageClient.tsx`)

```tsx
// app/community/_components/CommunityPageClient.tsx
'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostList } from '@/components/community/PostList';
import { SortSelector } from '@/components/community/SortSelector';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/community/ErrorBoundary';
import { NetworkError } from '@/components/community/NetworkError';
import { EmptyState } from '@/components/community/EmptyState';
import { toggleLike } from '@/app/actions/community';
import { useOptimisticLikes } from '@/lib/hooks/useOptimisticLikes';

interface CommunityPageClientProps {
  postsPromise: Promise<{ posts: any[]; total: number }>;
  currentUserId?: string;
}

export default function CommunityPageClient({ postsPromise, currentUserId }: CommunityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { posts, total } = use(postsPromise);

  const { likedPostIds, handleLikePost } = useOptimisticLikes(
    posts.map(post => post.id),
    currentUserId
  );

  // Pagination
  const currentPage = parseInt(searchParams.get('page') || '1');
  const totalPages = Math.ceil(total / 10);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/community?${params.toString()}`);
  };

  // New post button click
  const handleNewPost = () => {
    if (!currentUserId) {
      router.push('/auth/signin?redirect=/community');
      return;
    }

    router.push('/community/new');
  };

  if (posts.length === 0) {
    return <EmptyState onNewPost={handleNewPost} />;
  }

  return (
    <ErrorBoundary fallback={<NetworkError />}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SortSelector />
          <Button onClick={handleNewPost}>
            새 글 작성
          </Button>
        </div>

        <PostList
          posts={posts}
          onLike={handleLikePost}
          likedPostIds={likedPostIds}
        />

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
```

#### Post Detail Page (`app/community/[postId]/page.tsx`)

```tsx
// app/community/[postId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCommunityPost, getPostComments, hasUserLikedPost } from '@/lib/data/community';
import { PostDetail } from '@/components/community/PostDetail';
import { CommentSkeleton } from '@/components/community/CommentSkeleton';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface PostPageProps {
  params: { postId: string };
}

export default async function PostPage({ params }: PostPageProps) {
  // Extract actual UUID from slug-id format
  const postIdMatch = params.postId.match(/-([\w-]+)$/);
  if (!postIdMatch) notFound();

  const postId = postIdMatch[1];

  // Fetch data in parallel
  const postPromise = getCommunityPost(postId);
  const commentsPromise = getPostComments(postId);

  // Get current user for auth-dependent UI
  const supabase = createServerClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Check if user has liked the post (only if logged in)
  const isLikedPromise = currentUserId
    ? hasUserLikedPost(postId)
    : Promise.resolve(false);

  // Wait for post data
  const post = await postPromise;

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail
        post={post}
        commentsPromise={commentsPromise}
        isLikedPromise={isLikedPromise}
        currentUserId={currentUserId}
      />
    </div>
  );
}
```

#### Post Detail Component (`components/community/PostDetail.tsx`)

```tsx
// components/community/PostDetail.tsx
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { CommunityBreadcrumb } from './CommunityBreadcrumb';
import { ErrorBoundary } from './ErrorBoundary';
import { toggleLike, createComment, deleteComment } from '@/app/actions/community';
import { useOptimisticAction } from '@/lib/hooks/useOptimisticAction';

interface PostDetailProps {
  post: any;
  commentsPromise: Promise<any[]>;
  isLikedPromise: Promise<boolean>;
  currentUserId?: string;
}

export function PostDetail({
  post,
  commentsPromise,
  isLikedPromise,
  currentUserId
}: PostDetailProps) {
  const router = useRouter();
  const comments = use(commentsPromise);
  const initialIsLiked = use(isLikedPromise);

  // Optimistic UI for likes
  const { state: likeState, action: handleLike } = useOptimisticAction({
    action: toggleLike,
    initialState: { liked: initialIsLiked },
    optimisticUpdate: (state) => ({ liked: !state.liked }),
    onSuccess: () => router.refresh()
  });

  // Handle comment submission
  const handleAddComment = async (content: string, parentId?: string) => {
    if (!currentUserId) {
      router.push(`/auth/signin?redirect=/community/${post.id}`);
      return;
    }

    const formData = new FormData();
    formData.append('postId', post.id);
    formData.append('content', content);
    if (parentId) formData.append('parentId', parentId);

    await createComment(null as any, formData);
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    const formData = new FormData();
    formData.append('commentId', commentId);

    await deleteComment(null as any, formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 md:p-6">
        <CommunityBreadcrumb
          category={{ name: getCategoryName(post.category), slug: post.category.toLowerCase() }}
          apartment={{ name: post.apartment.name, id: post.apartment.id }}
        />

        <h1 className="text-2xl font-bold mt-4 mb-2">{post.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Avatar
              src={post.user.avatar_url || undefined}
              fallback={getInitials(post.user)}
            />
            <div>
              <div className="font-medium">{getUserDisplayName(post.user)}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ko
                })}
                {' · '}
                {post.apartment.name}
              </div>
            </div>
          </div>

          {currentUserId === post.user.id && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                수정
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500">
                삭제
              </Button>
            </div>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-2">
              {post.images.map((image: any) => (
                <div key={image.id} className="rounded-lg overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-images/${image.storage_path}`}
                    alt=""
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose max-w-none mb-6">
          {post.content.split('\n').map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b">
          <div className="flex items-center space-x-1">
            <LikeButton
              isLiked={likeState.liked}
              onClick={() => {
                if (!currentUserId) {
                  router.push(`/auth/signin?redirect=/community/${post.id}`);
                  return;
                }

                const formData = new FormData();
                formData.append('postId', post.id);
                handleLike(formData);
              }}
            />
            <span className="text-sm">
              {post.likes_count + (likeState.liked !== initialIsLiked ? (likeState.liked ? 1 : -1) : 0)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              조회 {post.views_count}
            </span>
            <span className="text-sm text-gray-500">
              댓글 {post.comments_count}
            </span>
          </div>
        </div>

        <ErrorBoundary fallback={<div>댓글을 불러오는 중 오류가 발생했습니다.</div>}>
          <CommentSection
            comments={comments}
            postId={post.id}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUserId}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'QNA': '질문과 답변',
    'RECOMMEND': '추천',
    'SECONDHAND': '중고거래',
    'FREE': '자유게시판'
  };
  return categories[category] || category;
}

function getInitials(user: any): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return user.email?.[0]?.toUpperCase() || '?';
}

function getUserDisplayName(user: any): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email?.split('@')[0] || 'Anonymous';
}
```

### Phase 4: Optimistic UI Hooks

#### Optimistic Action Hook (`lib/hooks/useOptimisticAction.ts`)

```typescript
// lib/hooks/useOptimisticAction.ts
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';

interface UseOptimisticActionProps<T, R> {
  action: (prevState: any, formData: FormData) => Promise<R>;
  initialState: T;
  optimisticUpdate: (currentState: T) => T;
  onSuccess?: (result: R) => void;
  onError?: (error: string) => void;
}

export function useOptimisticAction<T, R extends { error?: string; success?: string; data?: any }>({
  action,
  initialState,
  optimisticUpdate,
  onSuccess,
  onError
}: UseOptimisticActionProps<T, R>) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const handleAction = async (formData: FormData) => {
    // Apply optimistic update
    setState(optimisticUpdate(state));

    // Perform actual action
    startTransition(async () => {
      try {
        const result = await action(null, formData);

        if (result.error) {
          // Revert optimistic update on error
          setState(initialState);
          setError(result.error);
          onError?.(result.error);
        } else {
          // Success
          onSuccess?.(result);
        }
      } catch (err: any) {
        // Revert optimistic update on exception
        setState(initialState);
        setError(err.message || 'An error occurred');
        onError?.(err.message || 'An error occurred');
      }
    });
  };

  return {
    state,
    isPending,
    error,
    action: handleAction
  };
}
```

#### Optimistic Likes Hook (`lib/hooks/useOptimisticLikes.ts`)

```typescript
// lib/hooks/useOptimisticLikes.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleLike } from '@/app/actions/community';

export function useOptimisticLikes(postIds: string[], currentUserId?: string) {
  const router = useRouter();
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  // Fetch initial like status for all posts
  useEffect(() => {
    if (!currentUserId || postIds.length === 0) return;

    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/community/likes?postIds=${postIds.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch likes');

        const data = await response.json();
        setLikedPostIds(new Set(data.likedPostIds));
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [postIds, currentUserId]);

  const handleLikePost = async (postId: string) => {
    if (!currentUserId) {
      router.push(`/auth/signin?redirect=/community`);
      return;
    }

    // Prevent duplicate requests
    if (pendingLikes.has(postId)) return;

    // Optimistically update UI
    setLikedPostIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Mark as pending
    setPendingLikes(prev => new Set(prev).add(postId));

    // Perform actual action
    try {
      const formData = new FormData();
      formData.append('postId', postId);
      await toggleLike(null as any, formData);
    } catch (error) {
      // Revert on error
      setLikedPostIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      console.error('Error toggling like:', error);
    } finally {
      // Remove from pending
      setPendingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  return {
    likedPostIds: Array.from(likedPostIds),
    pendingLikes: Array.from(pendingLikes),
    handleLikePost
  };
}
```

### Phase 5: Mobile Optimization & Accessibility

#### Mobile Navigation (`components/community/MobileNavigation.tsx`)

```tsx
// components/community/MobileNavigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Plus } from 'lucide-react';

interface MobileNavigationProps {
  categories: {
    id: string;
    name_ko: string;
    slug: string;
  }[];
  apartments: {
    id: string;
    name: string;
    city_id: string;
  }[];
  onNewPost: () => void;
}

export function MobileNavigation({
  categories,
  apartments,
  onNewPost
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category');
  const activeApartment = searchParams.get('apartment');

  // Group apartments by city
  const apartmentsByCity: Record<string, typeof apartments> = {};
  apartments.forEach(apartment => {
    if (!apartmentsByCity[apartment.city_id]) {
      apartmentsByCity[apartment.city_id] = [];
    }
    apartmentsByCity[apartment.city_id].push(apartment);
  });

  // City names in Korean
  const cityNames: Record<string, string> = {
    'hcm': '호치민',
    'hanoi': '하노이',
    'danang': '다낭'
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b md:hidden">
      <div className="flex items-center justify-between px-4 py-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="메뉴">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[350px]">
            <div className="py-6 space-y-6">
              <div>
                <h3 className="font-medium mb-2">카테고리</h3>
                <div className="space-y-1">
                  <Link
                    href="/community"
                    className={`block px-2 py-1.5 rounded-md ${
                      pathname === '/community' && !activeCategory
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    전체
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/community?category=${category.slug}`}
                      className={`block px-2 py-1.5 rounded-md ${
                        activeCategory === category.slug
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name_ko}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">지역</h3>
                {Object.entries(apartmentsByCity).map(([cityId, cityApartments]) => (
                  <div key={cityId} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      {cityNames[cityId] || cityId}
                    </h4>
                    <div className="space-y-1 pl-2">
                      {cityApartments.map(apartment => (
                        <Link
                          key={apartment.id}
                          href={`/community?apartment=${apartment.id}`}
                          className={`block px-2 py-1 rounded-md text-sm ${
                            activeApartment === apartment.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {apartment.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-medium">커뮤니티</h1>

        <Button size="icon" onClick={onNewPost} aria-label="새 글 작성">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
```

#### Accessibility Improvements

1. **Keyboard Navigation**

```tsx
// components/community/PostCard.tsx (excerpt)
export function PostCard({ post, onLike, isLiked }: PostCardProps) {
  // ...

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link
        href={`/community/${slug}-${post.id}`}
        className="block p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* ... */}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* ... */}

          <div className="flex items-center space-x-3">
            <button
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-full p-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike(post.id);
              }}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              aria-pressed={isLiked}
            >
              <LikeButton isLiked={isLiked} />
              <span className="ml-1">{post.likes_count}</span>
            </button>

            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments_count}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
```

2. **Screen Reader Support**

```tsx
// components/community/EmptyState.tsx
export function EmptyState({ onNewPost }: { onNewPost: () => void }) {
  return (
    <div className="text-center py-12" role="status" aria-live="polite">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">게시글이 없습니다</h3>
      <p className="mt-1 text-sm text-gray-500">첫 번째 게시글을 작성해보세요!</p>
      <div className="mt-6">
        <Button onClick={onNewPost}>
          새 글 작성
        </Button>
      </div>
    </div>
  );
}
```

### Phase 6: Korean Localization

#### Korean Translation System (`lib/i18n/ko.json`)

```json
{
  "community": {
    "title": "커뮤니티",
    "newPost": "새 글 작성",
    "categories": {
      "all": "전체",
      "qna": "질문과 답변",
      "recommend": "추천",
      "secondhand": "중고거래",
      "free": "자유게시판"
    },
    "cities": {
      "hcm": "호치민",
      "hanoi": "하노이",
      "danang": "다낭"
    },
    "post": {
      "title": "제목",
      "content": "내용",
      "category": "카테고리",
      "location": "지역",
      "submit": "게시하기",
      "cancel": "취소",
      "comments": "댓글",
      "writeComment": "댓글 작성",
      "delete": "삭제",
      "edit": "수정",
      "report": "신고",
      "views": "조회",
      "likes": "좋아요"
    },
    "auth": {
      "loginRequired": "로그인이 필요합니다",
      "loginToUse": "이 기능을 사용하려면 로그인이 필요합니다.",
      "login": "로그인",
      "cancel": "취소"
    },
    "errors": {
      "loadFailed": "데이터를 불러오는데 실패했습니다.",
      "networkError": "네트워크 오류가 발생했습니다.",
      "tryAgain": "다시 시도해주세요"
    }
  }
}
```

#### Translation Hook (`lib/hooks/useTranslation.ts`)

```typescript
// lib/hooks/useTranslation.ts
'use client';

import { useCallback } from 'react';
import ko from '@/lib/i18n/ko.json';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<typeof ko>;

export function useTranslation() {
  const t = useCallback((key: TranslationKey, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = ko;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    if (typeof value !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(`{{${paramKey}}}`, paramValue),
        value
      );
    }

    return value;
  }, []);

  return { t };
}
```

## 3. Performance Optimizations

### Server-Side Rendering & Streaming

1. **React Server Components**: Use RSCs for initial data fetching and rendering
2. **Suspense Boundaries**: Enable streaming and progressive rendering
3. **Parallel Data Fetching**: Fetch data in parallel using Promise.all
4. **Selective Hydration**: Only hydrate interactive parts of the UI

### Database Optimizations

1. **Indexes**: Create indexes on frequently queried columns

```sql
-- Create indexes for common queries
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_apartment_id ON community_posts(apartment_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_post_likes_post_id_user_id ON community_post_likes(post_id, user_id);
```

2. **Pagination**: Implement efficient pagination using LIMIT/OFFSET or keyset pagination
3. **Soft Deletion**: Use is_deleted flag instead of actually deleting records
4. **Denormalization**: Store counts (likes, comments) directly on posts table

### Client-Side Optimizations

1. **Code Splitting**: Use dynamic imports for less critical components
2. **Image Optimization**: Implement responsive images and lazy loading
3. **Optimistic UI Updates**: Update UI immediately before server confirmation
4. **Memoization**: Use React.memo, useMemo, and useCallback for expensive computations

## 4. Security Considerations

1. **Row Level Security**: Implement RLS policies for all tables
2. **Input Validation**: Use Zod for schema validation on all inputs
3. **XSS Prevention**: Sanitize user-generated content
4. **CSRF Protection**: Implement CSRF protection for all mutations
5. **Rate Limiting**: Add rate limiting for API endpoints

## 5. Testing Strategy

1. **Unit Tests**: Test individual components and hooks
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user flows
4. **API Tests**: Test API endpoints and server actions

## 6. Deployment Considerations

1. **Database Migrations**: Use Supabase migrations for schema changes
2. **Environment Variables**: Configure environment variables for different environments
3. **Error Monitoring**: Implement error tracking and monitoring
4. **Analytics**: Add analytics to track user engagement

## Conclusion

This implementation plan provides a comprehensive approach to building a modern, performant community feature for your Vietnamese real estate platform targeting Korean expatriates. By leveraging Next.js App Router, React Server Components, Supabase, and modern data fetching patterns, you can create a robust community feature that allows Korean expatriates to connect, share information about neighborhoods, and discuss real estate topics in Vietnam.

The plan incorporates best practices for performance, security, and user experience, while also providing Korean language support and cultural relevance for your target audience. By following this plan, you'll create a community feature that significantly enhances the value of your platform by combining property listings with community engagement.