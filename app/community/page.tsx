import { getPosts, getCities, getApartments } from '@/lib/data/community';
import { CommunityPageClient } from './_components/CommunityPageClient';
import { COMMUNITY_CATEGORIES } from '@/lib/validation/community';

function isCommunityCategory(
  value: string
): value is (typeof COMMUNITY_CATEGORIES)[number] {
  return COMMUNITY_CATEGORIES.includes(
    value as (typeof COMMUNITY_CATEGORIES)[number]
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const city = typeof searchParams.city === 'string' ? searchParams.city : '';
  const apartmentId =
    typeof searchParams.apartmentId === 'string'
      ? searchParams.apartmentId
      : '';
  const categoryParam =
    typeof searchParams.category === 'string' ? searchParams.category : '';
  const category = isCommunityCategory(categoryParam)
    ? categoryParam
    : undefined;

  const cities = await getCities();
  const apartmentsData = await getApartments();
  const apartments =
    apartmentsData?.map((apt) => ({
      ...apt,
      cities: Array.isArray(apt.cities) ? apt.cities[0] : apt.cities,
    })) ?? [];
  const posts = await getPosts({
    city: city || undefined,
    apartmentId: apartmentId || undefined,
    category,
    sort: 'latest',
  });

  return (
    <CommunityPageClient
      posts={posts}
      cities={cities}
      apartments={apartments}
      initialCategory={categoryParam}
      initialApartmentId={apartmentId}
    />
  );
}
