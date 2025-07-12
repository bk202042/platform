import { ApartmentSelect } from '@/components/community/ApartmentSelect';
import { PostCard } from '@/components/community/PostCard';
import { COMMUNITY_CATEGORIES } from '@/lib/validation/community';
import { getPosts, getCities, getApartments } from '@/lib/data/community';
import { revalidatePath } from 'next/cache';
import { NewPostDialogClient } from './_components/NewPostDialog.client';

function isCommunityCategory(value: string): value is typeof COMMUNITY_CATEGORIES[number] {
  return COMMUNITY_CATEGORIES.includes(value as typeof COMMUNITY_CATEGORIES[number]);
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Await the searchParams Promise to access its values
  const params = await searchParams;
  const city = typeof params.city === 'string' ? params.city : '';
  const apartmentId = typeof params.apartmentId === 'string' ? params.apartmentId : '';
  const categoryParam = typeof params.category === 'string' ? params.category : '';
  const category = isCommunityCategory(categoryParam) ? categoryParam : undefined;

  // 실제 구현시 아래 함수로 데이터 패칭
  const cities = await getCities();
  const apartments = await getApartments();
  const posts = await getPosts({
    city: city || undefined,
    apartmentId: apartmentId || undefined,
    category,
    sort: 'latest',
  });

  async function handlePostCreated() {
    'use server';
    revalidatePath('/community');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <ApartmentSelect
          cities={cities}
          apartments={apartments}
          value={apartmentId}
          onChange={() => {}}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={categoryParam}
            onChange={() => {}}
            aria-label="카테고리 선택"
          >
            <option value="">전체 카테고리</option>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* 글 작성 버튼 및 모달 */}
          <NewPostDialogClient
            open={false} // 실제로는 useState로 showDialog 관리
            onClose={() => {}}
            cities={cities}
            apartments={apartments}
            onPostCreated={handlePostCreated}
          />
        </div>
      </div>
      {/* 글 목록 */}
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
