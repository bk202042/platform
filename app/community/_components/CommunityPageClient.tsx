"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostList } from "@/components/community/PostList";
import { SortSelector, SortOption } from "@/components/community/SortSelector";
import { CategorySidebar } from "./CategorySidebar";
import { CommunityBreadcrumb } from "@/components/community/CommunityBreadcrumb";
import { MobileNavigation } from "@/components/community/MobileNavigation";
import { ErrorBoundary } from "@/components/community/ErrorBoundary";
import { ApartmentSelector } from "@/components/community/ApartmentSelector";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { PullToRefresh } from "@/components/community/PullToRefresh";
import { MobileBottomNavigation } from "@/components/community/MobileBottomNavigation";

import { NewPostDialogClient } from "./NewPostDialog.client";
import { Button } from "@/components/ui/button";
import { CommunityCategory } from "@/lib/validation/community";
import { Plus } from "lucide-react";

// Define types for props
interface City {
  id: string;
  name: string;
}
interface Apartment {
  id: string;
  name: string;
  city_id: string;
  cities: { name: string } | null;
}

import { PostImage } from "@/lib/types/community";

export interface Post {
  id: string;
  title?: string;
  body: string;
  images?: PostImage[];
  user?: { id?: string; name?: string; avatar_url?: string };
  created_at: string;
  likes_count: number;
  comments_count: number;
  category?: CommunityCategory;
  apartments?: {
    name: string;
    cities?: { name: string } | null;
  };
  isOptimistic?: boolean;
}
interface CommunityPageClientProps {
  posts: Post[];
  cities: City[];
  apartments: Apartment[];
  initialCategory: string;
  initialApartmentId: string;
  postCounts?: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export function CommunityPageClient({
  posts,
  cities,
  apartments,
  initialCategory: _initialCategory,
  initialApartmentId: _initialApartmentId,
  postCounts,
}: CommunityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get current values from URL - URL is the source of truth
  const urlCategory = searchParams.get("category") || "";
  const urlApartmentId = searchParams.get("apartmentId") || "";
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [optimisticPosts, setOptimisticPosts] = useState(posts);
  const [listMode, setListMode] = useState(true); // Default to Daangn-style compact layout

  // Sync optimisticPosts with fresh server data when filtering changes
  useEffect(() => {
    setOptimisticPosts(posts);
  }, [posts]);

  // Get current sort from URL params
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  const handleApartmentChange = useCallback(
    (apartmentId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (apartmentId && apartmentId !== "all") {
        params.set("apartmentId", apartmentId);
      } else {
        params.delete("apartmentId");
      }
      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );


  const handleCategoryChange = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );


  // Use URL values directly for consistent state
  // Memoize expensive computations using URL values (kept for potential future use)
  const _currentApartment = useMemo(
    () => apartments.find((apt) => apt.id === urlApartmentId),
    [apartments, urlApartmentId]
  );

  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`/community/${postId}`);
    },
    [router]
  );

  const handleCreatePost = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handlePostCreated = useCallback((newPost: Post) => {
    setOptimisticPosts((prevPosts) => [newPost, ...prevPosts]);
    // Note: Dialog closing is handled by onClose callback to prevent duplicate state updates
  }, []);

  const handlePostRemoved = useCallback((postId: string) => {
    setOptimisticPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
  }, []);

  const handleRetry = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    // Add a small delay to make the refresh feel natural
    await new Promise(resolve => setTimeout(resolve, 500));
    router.refresh();
  }, [router]);

  return (
    <ErrorBoundary>
      {/* Mobile Navigation */}
      <MobileNavigation showBackButton={false} showMenu={true}>
        <Button
          size="sm"
          onClick={handleCreatePost}
          className="flex items-center gap-1 px-3 py-2 min-h-[36px] bg-[#007882] hover:bg-[#006670] text-white"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">글쓰기</span>
        </Button>
      </MobileNavigation>

      {/* Daangn-style layout with Korean font stack and semantic colors */}
      <div className="min-h-screen bg-zinc-50 font-['Apple_SD_Gothic_Neo','Malgun_Gothic','-apple-system','BlinkMacSystemFont',sans-serif]">
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Daangn design system */}
          <div className="bg-white border-b border-zinc-100 sticky top-0 z-40 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="px-5 sm:px-6 lg:px-8 py-5"> {/* 20px padding (Daangn standard) */}
              <CommunityBreadcrumb
                category={urlCategory as CommunityCategory}
                apartmentName={apartments.find(apt => apt.id === urlApartmentId)?.name}
                cityName={apartments.find(apt => apt.id === urlApartmentId)?.cities?.name}
              />
              <div className="flex items-center justify-between mt-4"> {/* 16px spacing */}
                <h1 className="text-2xl font-medium text-zinc-900 leading-[1.25]">동네생활</h1> {/* Daangn typography */}
                <Button
                  onClick={handleCreatePost}
                  className="hidden sm:flex items-center gap-2 bg-[#007882] hover:bg-[#006670] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 ease-out touch-target min-h-[44px]"
                >
                  <Plus size={18} />
                  글쓰기
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex">
            {/* Left Sidebar - Desktop only */}
            <aside className="hidden lg:block w-64 bg-white border-r border-zinc-200 min-h-screen sticky top-[77px]">
              <ErrorBoundary>
                <CategorySidebar postCounts={postCounts} />
              </ErrorBoundary>
            </aside>

            {/* Main Feed */}
            <main className="flex-1 min-w-0">
              <PullToRefresh
                onRefresh={handleRefresh}
                className="h-screen md:h-auto"
              >
                <div className="px-2 sm:px-3 lg:px-4 py-2">
                <ErrorBoundary>
                  {/* Enhanced Controls Section - Clean Trulia Style */}
                  <div className="mb-4 bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                    {/* Apartment Selection */}
                    <div className="p-5 border-b border-zinc-100">
                      <ApartmentSelector
                        apartments={apartments}
                        selectedId={urlApartmentId || "all"}
                        onSelect={handleApartmentChange}
                      />
                    </div>
                    
                    {/* Category Tabs */}
                    <CategoryTabs
                      selectedCategory={urlCategory}
                      onCategoryChange={handleCategoryChange}
                      postCounts={postCounts}
                    />
                    
                    {/* Sort Controls */}
                    <div className="flex justify-between items-center py-4 px-5 border-t border-zinc-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="lg:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-300 text-zinc-600 bg-white hover:bg-zinc-50 hover:border-zinc-400 h-9 px-4 text-xs font-medium rounded-lg touch-target transition-all duration-200 shadow-sm"
                          >
                            카테고리
                          </Button>
                        </div>
                        
                        {/* View Toggle - Enhanced style */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListMode(!listMode)}
                          className={`h-9 px-4 text-xs font-medium rounded-lg touch-target transition-all duration-200 shadow-sm ${
                            listMode 
                              ? 'bg-[#007882] text-white border-[#007882] hover:bg-[#006670] hover:border-[#006670] hover:shadow-md' 
                              : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400'
                          }`}
                        >
                          {listMode ? '목록' : '카드'}
                        </Button>
                      </div>
                      
                      <SortSelector value={currentSort} />
                    </div>
                  </div>

                  {/* Posts Feed */}
                  <div>
                    {optimisticPosts && optimisticPosts.length > 0 ? (
                      <PostList
                        posts={optimisticPosts}
                        onPostClick={handlePostClick}
                        onCreatePost={handleCreatePost}
                        onRetry={handleRetry}
                        listMode={listMode}
                      />
                    ) : (
                      <div className="text-center py-20 px-4">
                        <div className="max-w-sm mx-auto">
                          <div className="w-16 h-16 bg-white border-2 border-zinc-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm">
                            <Plus className="w-8 h-8 text-zinc-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-zinc-900 mb-2 leading-tight">
                            아직 게시글이 없어요
                          </h3>
                          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                            우리 동네의 첫 번째 이야기를 들려주세요!
                          </p>
                          <Button
                            onClick={handleCreatePost}
                            className="bg-gradient-to-r from-[#007882] to-[#00a0b0] hover:from-[#006670] hover:to-[#008b9a] text-white px-6 py-3 font-semibold rounded-xl transition-all duration-200 touch-target shadow-[0_4px_12px_rgba(0,120,130,0.25)] hover:shadow-[0_6px_20px_rgba(0,120,130,0.3)] hover:-translate-y-1"
                          >
                            첫 글 쓰기
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
                </div>
              </PullToRefresh>
            </main>
          </div>
        </div>

        {/* Enhanced Floating Action Button - Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <Button
            onClick={handleCreatePost}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-[#007882] to-[#00a0b0] hover:from-[#006670] hover:to-[#008b9a] active:from-[#005660] active:to-[#007680] text-white shadow-[0_8px_32px_rgba(0,120,130,0.3)] hover:shadow-[0_12px_40px_rgba(0,120,130,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 ease-out touch-target border-2 border-white/20 backdrop-blur-sm"
          >
            <Plus size={24} strokeWidth={2.5} className="drop-shadow-sm" />
          </Button>
        </div>
      </div>


      {/* New Post Dialog */}
      <Suspense fallback={null}>
        <NewPostDialogClient
          open={isDialogOpen}
          onClose={handleDialogClose}
          cities={cities || []}
          apartments={apartments || []}
          onPostCreated={handlePostCreated}
          onPostRemoved={handlePostRemoved}
        />
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation onCreatePost={handleCreatePost} />
    </ErrorBoundary>
  );
}
