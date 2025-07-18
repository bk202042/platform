import {
  getPostsWithLikeStatus,
  getCities,
  getApartments,
  getPostCountsByCategory,
} from "@/lib/data/community";
import { CommunityPageClient } from "./_components/CommunityPageClient";
import { COMMUNITY_CATEGORIES } from "@/lib/validation/community";
import { createClient } from "@/lib/supabase/server";

function isCommunityCategory(
  value: string,
): value is (typeof COMMUNITY_CATEGORIES)[number] {
  return COMMUNITY_CATEGORIES.includes(
    value as (typeof COMMUNITY_CATEGORIES)[number],
  );
}

interface CommunityPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const resolvedSearchParams = await searchParams;
  const city =
    typeof resolvedSearchParams.city === "string"
      ? resolvedSearchParams.city
      : "";
  const apartmentId =
    typeof resolvedSearchParams.apartmentId === "string"
      ? resolvedSearchParams.apartmentId
      : "";
  const categoryParam =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "";
  const category = isCommunityCategory(categoryParam)
    ? categoryParam
    : undefined;
  const sortParam =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "latest";
  const sort =
    sortParam === "popular" || sortParam === "latest" ? sortParam : "latest";

  // Get current user for like status
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cities = (await getCities()) || [];
  const apartmentsData = (await getApartments()) || [];
  const apartments =
    apartmentsData?.map((apt) => ({
      ...apt,
      cities: Array.isArray(apt.cities) ? apt.cities[0] : apt.cities,
    })) ?? [];
  const posts =
    (await getPostsWithLikeStatus({
      city: city || undefined,
      apartmentId: apartmentId || undefined,
      category,
      sort,
      userId: user?.id,
    })) || [];

  // Get post counts for categories
  const postCounts = (await getPostCountsByCategory({
    city: city || undefined,
    apartmentId: apartmentId || undefined,
  })) || { total: 0, byCategory: {} };

  return (
    <CommunityPageClient
      posts={posts}
      cities={cities}
      apartments={apartments}
      initialCategory={categoryParam}
      initialApartmentId={apartmentId}
      postCounts={postCounts}
    />
  );
}
