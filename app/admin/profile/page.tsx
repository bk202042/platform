import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSection } from "./_components/ProfileSection";
import { PostsSection } from "./_components/PostsSection";
import { getUserPostSummaries } from "@/lib/data/community";
import { PostSummary } from "@/lib/types/community";

export const metadata = {
  title: "프로필 | Vietnam Property Platform",
  description: "프로필 관리 및 게시글 관리",
};

interface PageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;
  const params = await searchParams;
  const currentSection = params.section || "profile";

  // Fetch posts data on server side for posts section
  let initialPosts: PostSummary[] = [];
  if (currentSection === "posts") {
    try {
      initialPosts = await getUserPostSummaries(user.id, { limit: 50 });
    } catch (_error) {
      // Fallback to empty array on error
      initialPosts = [];
    }
  }

  return (
    <div className="w-full">
      {/* Clean Trulia-inspired design - just the content */}
      {currentSection === "profile" && <ProfileSection user={user} />}
      {currentSection === "posts" && <PostsSection userId={user.id} initialPosts={initialPosts} />}
    </div>
  );
}