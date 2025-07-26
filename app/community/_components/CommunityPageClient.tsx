"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostList } from "@/components/community/PostList";
import { SortSelector, SortOption } from "@/components/community/SortSelector";
import { CategorySidebar } from "./CategorySidebar";
import { CommunityBreadcrumb } from "@/components/community/CommunityBreadcrumb";
import { MobileNavigation } from "@/components/community/MobileNavigation";
import { ErrorBoundary } from "@/components/community/ErrorBoundary";
import {
  LocationSelectorModal,
  LocationSelectorButton,
} from "@/components/community/LocationSelectorModal";
import { SearchBar } from "@/components/community/SearchBar";
import { LocationSearchResult } from "@/lib/data/vietnamese-locations";
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
  initialApartmentId,
  postCounts,
}: CommunityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apartmentId, setApartmentId] = useState(initialApartmentId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);
  const [optimisticPosts, setOptimisticPosts] = useState(posts);

  // Get current sort from URL params
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  const _handleApartmentChange = useCallback(
    (newApartmentId: string) => {
      setApartmentId(newApartmentId);
      const params = new URLSearchParams(searchParams.toString());
      if (newApartmentId) {
        params.set("apartmentId", newApartmentId);
      } else {
        params.delete("apartmentId");
      }
      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleLocationSelect = useCallback(
    (location: LocationSearchResult | null) => {
      setSelectedLocation(location);
      const params = new URLSearchParams(searchParams.toString());

      if (location) {
        if (location.type === "apartment") {
          params.set("apartmentId", location.id);
          setApartmentId(location.id);
        } else {
          // For city selection, clear apartment filter
          params.delete("apartmentId");
          setApartmentId("");
          // Could add city filter here if needed
        }
      } else {
        // Clear all location filters
        params.delete("apartmentId");
        setApartmentId("");
      }

      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );

  const currentCategory = searchParams.get("category");

  // Memoize expensive computations
  const currentApartment = useMemo(
    () => apartments.find((apt) => apt.id === apartmentId),
    [apartments, apartmentId]
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
          className="flex items-center gap-1 px-3 py-2 min-h-[36px] bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">글쓰기</span>
        </Button>
      </MobileNavigation>

      {/* Daangn-style layout with proper spacing */}
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Section - Daangn style */}
          <div className="bg-white border-b border-zinc-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <CommunityBreadcrumb
                category={currentCategory as CommunityCategory}
                apartmentName={currentApartment?.name}
                cityName={currentApartment?.cities?.name}
              />
              <div className="flex items-center justify-between mt-3">
                <h1 className="text-2xl font-bold text-zinc-900">동네생활</h1>
                <Button
                  onClick={handleCreatePost}
                  className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
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
            <aside className="hidden lg:block w-64 bg-white border-r border-zinc-200 min-h-screen sticky top-[73px]">
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
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                <ErrorBoundary>
                  {/* Controls Section */}
                  <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <SearchBar
                      onSearch={handleSearch}
                      onLocationSelect={handleLocationSelect}
                      placeholder="베트남 지역이나 아파트를 검색하세요..."
                      className="w-full max-w-2xl"
                    />

                    {/* Location and Sort Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <LocationSelectorButton
                          selectedLocation={selectedLocation}
                          onOpenModal={() => setIsLocationModalOpen(true)}
                          placeholder="지역을 선택하세요"
                          className="bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700"
                        />
                        {/* Mobile Category Filter */}
                        <div className="lg:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-300 text-zinc-700"
                          >
                            카테고리
                          </Button>
                        </div>
                      </div>
                      <SortSelector value={currentSort} />
                    </div>
                  </div>

                  {/* Posts Feed */}
                  <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
                    {optimisticPosts && optimisticPosts.length > 0 ? (
                      <PostList
                        posts={optimisticPosts}
                        onPostClick={handlePostClick}
                        onCreatePost={handleCreatePost}
                        onRetry={handleRetry}
                      />
                    ) : (
                      <div className="text-center py-16 px-4">
                        <div className="max-w-sm mx-auto">
                          <div className="w-16 h-16 bg-zinc-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-zinc-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                            아직 게시글이 없어요
                          </h3>
                          <p className="text-sm text-zinc-500 mb-6">
                            우리 동네의 첫 번째 이야기를 들려주세요!
                          </p>
                          <Button
                            onClick={handleCreatePost}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
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

        {/* Floating Action Button - Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <Button
            onClick={handleCreatePost}
            className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={24} />
          </Button>
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        title="지역 변경"
      />

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
