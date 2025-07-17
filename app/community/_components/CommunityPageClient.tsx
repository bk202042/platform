'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApartmentSelect } from '@/components/community/ApartmentSelect';
import { PostList } from '@/components/community/PostList';
import { SortSelector, SortOption } from '@/components/community/SortSelector';
import { LazyNewPostDialog } from './NewPostDialog.lazy';
import { CategorySidebar } from './CategorySidebar';
import { CommunityBreadcrumb } from '@/components/community/CommunityBreadcrumb';
import { MobileNavigation } from '@/components/community/MobileNavigation';
import { Button } from '@/components/ui/button';
import { CommunityCategory } from '@/lib/validation/community';
import { Plus } from 'lucide-react';

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

interface Post {
  id: string;
  title?: string;
  body: string;
  images?: string[];
  user?: { name?: string };
  created_at: string;
  likes_count: number;
  comments_count: number;
  category?: CommunityCategory;
  apartments?: {
    name: string;
    cities?: { name: string } | null;
  };
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

  // Get current sort from URL params
  const currentSort = (searchParams.get('sort') as SortOption) || 'latest';

  const handleApartmentChange = useCallback((newApartmentId: string) => {
    setApartmentId(newApartmentId);
    const params = new URLSearchParams(searchParams.toString());
    if (newApartmentId) {
      params.set('apartmentId', newApartmentId);
    } else {
      params.delete('apartmentId');
    }
    router.push(`/community?${params.toString()}`);
  }, [searchParams, router]);

  const currentCategory = searchParams.get('category');

  // Memoize expensive computations
  const currentApartment = useMemo(() =>
    apartments.find(apt => apt.id === apartmentId),
    [apartments, apartmentId]
  );

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/community/${postId}`);
  }, [router]);

  const handleCreatePost = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handlePostCreated = useCallback(() => {
    setIsDialogOpen(false);
    router.refresh();
  }, [router]);

  const handleRetry = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavigation
        showBackButton={false}
        showMenu={true}
      >
        <Button
          size="sm"
          onClick={handleCreatePost}
          className="flex items-center gap-1 px-3 py-2 min-h-[36px]"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">글쓰기</span>
        </Button>
      </MobileNavigation>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <CommunityBreadcrumb
            category={currentCategory as CommunityCategory}
            apartmentName={currentApartment?.name}
            cityName={currentApartment?.cities?.name}
          />
          <h1 className="text-3xl font-bold mt-4 hidden md:block">커뮤니티</h1>
        </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Left Sidebar */}
        <CategorySidebar postCounts={postCounts} />

        {/* Main Feed */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col gap-4 mb-6">
            {/* Top row: Apartment filter and Write Post button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <ApartmentSelect
                value={apartmentId}
                onChange={handleApartmentChange}
              />
              <Button onClick={handleCreatePost}>
                Write a Post
              </Button>
            </div>

            {/* Second row: Sort selector */}
            <div className="flex justify-end">
              <SortSelector value={currentSort} />
            </div>

            <LazyNewPostDialog
              open={isDialogOpen}
              onClose={handleDialogClose}
              cities={cities}
              apartments={apartments}
              onPostCreated={handlePostCreated}
            />
          </div>

          <PostList
            posts={posts}
            onPostClick={handlePostClick}
            onCreatePost={handleCreatePost}
            onRetry={handleRetry}
          />
        </main>
      </div>
    </div>
    </>
  );
}
