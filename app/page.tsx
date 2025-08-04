import { getPropertyListings } from "@/lib/data/property";
import { HeroSection } from "@/components/sections/HeroSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// PERFORMANCE: Dynamic imports for heavy components with optimized loading
const KoreanExpatriatesSection = dynamic(
  () => import("@/components/sections/KoreanExpatriatesSection").then(mod => ({ default: mod.KoreanExpatriatesSection })),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: true, // Enable SSR for SEO
  }
);

const FeaturedPropertiesClient = dynamic(
  () => import("@/components/featured/FeaturedPropertiesClient").then(mod => ({ default: mod.FeaturedPropertiesClient })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    ),
    ssr: true,
  }
);

const FeatureHighlightsSection = dynamic(
  () => import("@/components/sections/FeatureHighlightsSection").then(mod => ({ default: mod.FeatureHighlightsSection })),
  {
    loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false, // Client-only for interactive features
  }
);

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
      {/* Hero Section (Server Component) - Critical, render immediately */}
      <HeroSection />

      {/* Explore Section (Server Component) - Critical, render immediately */}
      <ExploreSection />

      {/* PERFORMANCE: Suspense boundaries for progressive loading */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse bg-gray-100 rounded-lg" />
          ))}
        </div>
      }>
        <FeaturedPropertiesClient
          rentProperties={rentResult.data || []}
          buyProperties={buyResult.data || []}
          totalProperties={allPropertiesResult.total || 0}
        />
      </Suspense>

      {/* PERFORMANCE: Defer non-critical interactive components */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded-lg" />}>
        <FeatureHighlightsSection />
      </Suspense>

      {/* PERFORMANCE: Defer informational content */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}>
        <KoreanExpatriatesSection />
      </Suspense>
    </div>
  );
}
