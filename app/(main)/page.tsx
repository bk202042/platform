import { getPropertyListings } from "@/lib/data/property";
import { KoreanExpatriatesSection } from "@/components/sections/KoreanExpatriatesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureHighlightsSection } from "@/components/sections/FeatureHighlightsSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import dynamic from "next/dynamic";

// Solution 2: Dynamic import with next/dynamic
const FeaturedPropertiesClient = dynamic(
  () => import("@/components/featured/FeaturedPropertiesClient").then(mod => mod.FeaturedPropertiesClient),
  { ssr: true } // Enable server-side rendering for better performance
);

// This is now an async Server Component
export default async function Home() {
  // Fetch featured properties on the server
  const rentResult = await getPropertyListings({
    propertyType: "월세",
    limit: 3,
  });
  const buyResult = await getPropertyListings({
    propertyType: "매매",
    limit: 3,
  });

  // Get total properties count on the server
  // Note: Fetching with limit: 1 might not give the *actual* total if there are 0 properties.
  // Consider adding a dedicated count function in lib/data/property.ts if precise total is needed.
  const allPropertiesResult = await getPropertyListings({ limit: 1 }); // Re-evaluate if this is the best way to get total

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section (Server Component) */}
      <HeroSection />

      {/* Explore Section (Server Component) */}
      <ExploreSection />

      {/* Featured Properties Section (Client Component, receives server-fetched data) */}
      <FeaturedPropertiesClient
        rentProperties={rentResult.data || []} // Pass fetched data as props, provide default empty array
        buyProperties={buyResult.data || []} // Pass fetched data as props, provide default empty array
        totalProperties={allPropertiesResult.total || 0} // Pass fetched total, provide default 0
      />

      {/* Feature Highlights Section (Client Component) */}
      <FeatureHighlightsSection />

      {/* For Korean Expatriates Section (Server Component) */}
      <KoreanExpatriatesSection />
    </div>
  );
}
