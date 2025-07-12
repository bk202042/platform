'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApartmentSelect } from '@/components/community/ApartmentSelect';
import { PostCard } from '@/components/community/PostCard';
import { COMMUNITY_CATEGORIES } from '@/lib/validation/community';
import { NewPostDialogClient } from './NewPostDialog.client';

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
}
interface CommunityPageClientProps {
  posts: Post[];
  cities: City[];
  apartments: Apartment[];
  initialCategory: string;
  initialApartmentId: string;
}

export function CommunityPageClient({
  posts,
  cities,
  apartments,
  initialCategory,
  initialApartmentId,
}: CommunityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(initialCategory);
  const [apartmentId, setApartmentId] = useState(initialApartmentId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    router.push(`/community?${params.toString()}`);
  };

  const handleApartmentChange = (newApartmentId: string) => {
    setApartmentId(newApartmentId);
    const params = new URLSearchParams(searchParams.toString());
    if (newApartmentId) {
      params.set('apartmentId', newApartmentId);
    } else {
      params.delete('apartmentId');
    }
    router.push(`/community?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <ApartmentSelect
          value={apartmentId}
          onChange={handleApartmentChange}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={category}
            onChange={handleCategoryChange}
            aria-label="카테고리 선택"
          >
            <option value="">전체 카테고리</option>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button onClick={() => setIsDialogOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            글 작성
          </button>
          <NewPostDialogClient
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            cities={cities}
            apartments={apartments}
            onPostCreated={() => {
              setIsDialogOpen(false);
              router.refresh();
            }}
          />
        </div>
      </div>
      <div>
        {posts.length === 0 ? (
          <div className="text-gray-400 text-center py-12">게시글이 없습니다.</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
