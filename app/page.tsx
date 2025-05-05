import { getPropertyListings } from "@/lib/data/property";
import { KoreanExpatriatesSection } from "@/components/sections/KoreanExpatriatesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureHighlightsSection } from "@/components/sections/FeatureHighlightsSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import { FeaturedPropertiesClient } from "@/components/featured/FeaturedPropertiesClient";

// Direct implementation at root level to avoid route group client reference issues
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
  const allPropertiesResult = await getPropertyListings({ limit: 1 });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section (Server Component) */}
      <HeroSection />

      {/* Explore Section (Server Component) */}
      <ExploreSection />

      {/* Featured Properties Section (Client Component, receives server-fetched data) */}
      <FeaturedPropertiesClient
        rentProperties={rentResult.data || []}
        buyProperties={buyResult.data || []}
        totalProperties={allPropertiesResult.total || 0}
      />

      {/* Feature Highlights Section (Client Component) */}
      <FeatureHighlightsSection />

      {/* For Korean Expatriates Section (Server Component) */}
      <KoreanExpatriatesSection />
    </div>
  );
}
