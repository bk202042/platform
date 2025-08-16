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
      <div className="lg:hidden">
        <MobileHeader user={user} currentSection={currentSection} />
      </div>
      
      {/* Desktop Layout Grid */}
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr] lg:max-w-7xl lg:mx-auto lg:min-h-screen">
        {/* Left Sidebar - Only rendered on desktop */}
        <Sidebar user={user} currentSection={currentSection} />
        
        {/* Main Content - Desktop */}
        <main className="lg:overflow-hidden">
          <div className="p-8">
            {currentSection === "profile" && <ProfileSection user={user} />}
            {currentSection === "posts" && <PostsSection userId={user.id} initialPosts={initialPosts} />}
          </div>
        </main>
      </div>

      {/* Mobile Layout - Full width, no sidebar */}
      <div className="lg:hidden">
        <main className="w-full">
          <div className="pt-16 p-4">
            {currentSection === "profile" && <ProfileSection user={user} />}
            {currentSection === "posts" && <PostsSection userId={user.id} initialPosts={initialPosts} />}
          </div>
        </main>
      </div>
    </div>
  );
}