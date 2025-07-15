import { PostCard } from '@/components/community/PostCard';
import { LikeButton } from '@/components/community/LikeButton.client';
import { CommentList, Comment } from '@/components/community/CommentList';
import { CommentForm } from '@/components/community/CommentForm.client';
import { getPostById } from '@/lib/data/community';

export default async function CommunityPostDetailPage({ params }: { params: { postId: string } }) {
  const postId = params.postId;
  // SSR 데이터 패칭
  const post = await getPostById(postId);
  // const commentsSSR: Comment[] = await getComments(postId); // getComments 제거
  const commentsSSR: Comment[] = [];

  // 클라이언트 상태(optimistic UI)는 useState로 분리 (예시)
  // const [liked, setLiked] = useState(post.likedByMe);
  // const [likeCount, setLikeCount] = useState(post.likes_count);
  // const [comments, setComments] = useState<Comment[]>(commentsSSR);

  // 실제로는 아래 부분을 클라이언트 컴포넌트로 분리해야 함

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PostCard post={post} />
      <div className="flex items-center gap-4 mt-4 mb-6">
        <LikeButton
          postId={post.id}
          initialLiked={post.likedByMe}
          initialCount={post.likes_count}
        />
        <span className="text-gray-500 text-sm">댓글 {commentsSSR.length}개</span>
      </div>
      <section className="mt-6">
        <h3 className="text-base font-semibold mb-2">댓글</h3>
        <CommentForm
          postId={post.id}
          onCommentAdded={() => {
            // TODO: 클라이언트 상태로 optimistic UI로 댓글 추가
          }}
        />
        <CommentList comments={commentsSSR} />
      </section>
    </div>
  );
}
