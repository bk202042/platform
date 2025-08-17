import { createClient } from "@/lib/supabase/server";
import { getPostByIdWithLikeStatus, getCities, getApartments } from "@/lib/data/community";
import { redirect } from "next/navigation";
import { EditPostForm } from "@/components/community/EditPostForm";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const supabase = await createClient();
  const { postId } = await params;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Get post data
  const post = await getPostByIdWithLikeStatus(postId, session.user.id);

  if (!post) {
    redirect("/community");
  }

  // Check if user owns the post
  if (post.user_id !== session.user.id) {
    redirect("/community");
  }

  // Check edit time window (24 hours)
  const postAge = Date.now() - new Date(post.created_at).getTime();
  const hoursSinceCreated = postAge / (1000 * 60 * 60);
  
  if (hoursSinceCreated > 24) {
    redirect("/admin/profile?section=posts&error=edit_expired");
  }

  // Get cities and apartments for selectors
  const [cities, apartments] = await Promise.all([
    getCities(),
    getApartments(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
        <p className="text-sm text-gray-600 mt-1">
          게시글은 작성 후 24시간 내에만 수정할 수 있습니다.
        </p>
      </div>

      <EditPostForm
        post={post}
        cities={cities}
        apartments={apartments}
      />
    </div>
  );
}