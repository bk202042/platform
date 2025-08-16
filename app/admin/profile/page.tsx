import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { MobileHeader } from "./_components/MobileHeader";
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
    <div className="min-h-screen bg-white">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader user={user} currentSection={currentSection} />
      
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <Sidebar user={user} currentSection={currentSection} />
        
        {/* Main Content */}
        <main className="flex-1 w-full lg:pl-80">
          <div className="pt-16 lg:pt-0 p-4 lg:p-8">
            {currentSection === "profile" && <ProfileSection user={user} />}
            {currentSection === "posts" && <PostsSection userId={user.id} initialPosts={initialPosts} />}
          </div>
        </main>
      </div>
    </div>
  );
}