import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PostDetail } from '@/components/community/PostDetail';
import { CommentSection } from '@/components/community/CommentSection';
import { CommunityBreadcrumb } from '@/components/community/CommunityBreadcrumb';
import { getPostByIdWithLikeStatus, getComments } from '@/lib/data/community';
import { createClient } from '@/lib/supabase/server';
import { MessageCircle, Heart, User } from 'lucide-react';

// Following Senior Engineer's Guide: PageProps Blueprint
interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

// Generate metadata for SEO with Korean content
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostByIdWithLikeStatus(postId);

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    };
  }

  const title = post.title || post.body.slice(0, 50);
  const description = post.body.slice(0, 160);
  const apartmentInfo = post.apartments
    ? `${post.apartments.cities?.name} ${post.apartments.name}`
    : '';

  return {
    title: `${title} - 커뮤니티`,
    description: `${description}... ${apartmentInfo}`,
    openGraph: {
      title: `${title} - 커뮤니티`,
      description: `${description}... ${apartmentInfo}`,
      type: 'article',
      images: post.images?.slice(0, 1) || [],
    },
  };
}

export default async function CommunityPostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  try {
    // Get current user for like status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Server-side data fetching with error handling
    const [post, commentsSSR] = await Promise.all([
      getPostByIdWithLikeStatus(postId, user?.id),
      getComments(postId)
    ]);

    // Handle post not found
    if (!post) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <div className="mb-8">
            <CommunityBreadcrumb
              postTitle={post.title || post.body.slice(0, 30)}
              category={post.category}
              apartmentName={post.apartments?.name}
              cityName={post.apartments?.cities?.name}
              showMobileBack={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Post detail */}
              <PostDetail post={post} />

              {/* Comments section */}
              <CommentSection
                postId={post.id}
                initialComments={commentsSSR}
                currentUserId={user?.id}
              />
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Post info card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    게시글 정보
                  </h3>
                  <div className="space-y-4">
                    {post.apartments && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">위치</span>
                        <span className="font-medium text-gray-900">
                          {post.apartments.cities?.name} · {post.apartments.name}
                        </span>
                      </div>
                    )}
                    {post.category && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">카테고리</span>
                        <span className="font-medium text-gray-900">
                          {post.category === 'QNA' && 'Q&A'}
                          {post.category === 'RECOMMEND' && '추천'}
                          {post.category === 'SECONDHAND' && '중고거래'}
                          {post.category === 'FREE' && '나눔'}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">작성일</span>
                      <span className="font-medium text-gray-900">
                        {new Date(post.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">참여도</span>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                          <Heart size={14} className="text-red-500" />
                          {post.likes_count}
                        </span>
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                          <MessageCircle size={14} className="text-blue-500" />
                          {commentsSSR.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Author info card */}
                {post.user && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      작성자
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {post.user.name || '익명'}
                        </p>
                        <p className="text-sm text-gray-500">
                          커뮤니티 멤버
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    // Return a proper error page
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <MessageCircle size={24} className="text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            게시글을 불러올 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
}
