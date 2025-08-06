"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostList } from "@/components/community/PostList";
import { SortSelector, SortOption } from "@/components/community/SortSelector";
import { CategorySidebar } from "./CategorySidebar";
import { CommunityBreadcrumb } from "@/components/community/CommunityBreadcrumb";
import { MobileNavigation } from "@/components/community/MobileNavigation";
import { ErrorBoundary } from "@/components/community/ErrorBoundary";
import { UnifiedSearchInterface } from "@/components/community/UnifiedSearchInterface";
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
  const [currentLocation, setCurrentLocation] = useState<LocationSearchResult | null>(null);
  const [optimisticPosts, setOptimisticPosts] = useState(posts);
  const [listMode, setListMode] = useState(true); // Default to Daangn-style compact layout


  // Get current sort from URL params
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  const _handleApartmentChange = useCallback(
    (newApartmentId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newApartmentId) {
        params.set("apartmentId", newApartmentId);
      } else {
        params.delete("apartmentId");
      }
      router.push(`/community?${params.toString()}`);
      // Note: setApartmentId is handled by useEffect when URL changes
    },
    [searchParams, router]
  );

  const handleLocationChange = useCallback(
    (location: LocationSearchResult | null) => {
      setCurrentLocation(location);
      const params = new URLSearchParams(searchParams.toString());

      if (location) {
        if (location.type === "apartment") {
          params.set("apartmentId", location.id);
        } else {
          // For city selection, clear apartment filter
          params.delete("apartmentId");
          // Could add city filter here if needed
        }
      } else {
        // Clear all location filters
        params.delete("apartmentId");
      }

      router.push(`/community?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleContentSearch = useCallback(
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

  // Sync currentLocation with URL parameters
  useEffect(() => {
    if (urlApartmentId) {
      const apartment = apartments.find((apt) => apt.id === urlApartmentId);
      if (apartment) {
        const locationResult: LocationSearchResult = {
          id: apartment.id,
          type: "apartment",
          name: apartment.name,
          name_ko: apartment.name,
          full_address: apartment.cities?.name || "",
          full_address_ko: apartment.cities?.name || "",
          city_name: apartment.cities?.name || "",
          city_name_ko: apartment.cities?.name || "",
          similarity_score: 1.0,
        };
        setCurrentLocation(locationResult);
      }
    } else {
      setCurrentLocation(null);
    }
  }, [urlApartmentId, apartments]);

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
          className="flex items-center gap-1 px-3 py-2 min-h-[36px] bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">글쓰기</span>
        </Button>
      </MobileNavigation>

      {/* Daangn-style layout with proper spacing */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Daangn style */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <CommunityBreadcrumb
                category={urlCategory as CommunityCategory}
                apartmentName={currentLocation?.type === "apartment" ? currentLocation.name : undefined}
                cityName={currentLocation?.city_name || currentLocation?.name}
              />
              <div className="flex items-center justify-between mt-3">
                <h1 className="text-2xl font-bold text-gray-900">동네생활</h1>
                <Button
                  onClick={handleCreatePost}
                  className="hidden sm:flex items-center gap-2 bg-carrot-500 hover:bg-carrot-600 text-white px-4 py-2 rounded-lg font-semibold transition-daangn touch-target"
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
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-[77px]">
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
                  {/* Search Interface and Controls Section - Daangn style */}
                  <div className="mb-2 bg-white rounded-lg border border-gray-200 shadow-daangn-sm overflow-hidden">
                    {/* Unified Search Interface */}
                    <UnifiedSearchInterface
                      initialLocation={currentLocation}
                      onLocationChange={handleLocationChange}
                      onContentSearch={handleContentSearch}
                      onCreatePost={handleCreatePost}
                      postCount={postCounts?.total}
                      activeUserCount={12} // TODO: Get from real data
                      showCreateButton={false} // We have other create buttons
                    />
                    
                    {/* Sort Controls - positioned below search like Daangn */}
                    <div className="flex justify-between items-center py-3 px-4 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="lg:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-600 bg-white h-8 px-3 text-xs font-medium rounded-md touch-target"
                          >
                            카테고리
                          </Button>
                        </div>
                        
                        {/* View Toggle - Daangn style */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setListMode(!listMode)}
                          className={`h-8 px-3 text-xs font-medium rounded-md touch-target transition-colors ${
                            listMode 
                              ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' 
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
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
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                            아직 게시글이 없어요
                          </h3>
                          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            우리 동네의 첫 번째 이야기를 들려주세요!
                          </p>
                          <Button
                            onClick={handleCreatePost}
                            className="bg-carrot-500 hover:bg-carrot-600 text-white px-6 py-3 font-semibold rounded-lg transition-daangn touch-target"
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

        {/* Floating Action Button - Mobile with enhanced touch target */}
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <Button
            onClick={handleCreatePost}
            className="w-16 h-16 rounded-full bg-carrot-500 hover:bg-carrot-600 active:bg-carrot-700 text-white shadow-daangn-xl hover:shadow-daangn-xl hover:scale-105 active:scale-95 transition-daangn touch-target"
          >
            <Plus size={24} strokeWidth={2.5} />
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
          initialLocation={currentLocation}
        />
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation onCreatePost={handleCreatePost} />
    </ErrorBoundary>
  );
}
