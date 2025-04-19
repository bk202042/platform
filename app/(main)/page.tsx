import { getPropertyListings } from '@/lib/data/property';
import { KoreanExpatriatesSection } from '@/components/sections/KoreanExpatriatesSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { ExploreSection } from '@/components/sections/ExploreSection';
import { FeaturedPropertiesSection } from '@/components/sections/FeaturedPropertiesSection';

export default async function Home() {
  // Fetch featured properties
  const rentResult = await getPropertyListings({ propertyType: '월세', limit: 3 });
  const buyResult = await getPropertyListings({ propertyType: '매매', limit: 3 });

  // Get all properties for statistics
  const allPropertiesResult = await getPropertyListings({ limit: 1 });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Explore Section */}
      <ExploreSection />

      {/* Featured Properties Section */}
      <FeaturedPropertiesSection
        rentProperties={rentResult.data}
        buyProperties={buyResult.data}
        totalProperties={allPropertiesResult.total}
      />

      {/* For Korean Expatriates Section */}
      <KoreanExpatriatesSection />
    </div>
  );
}
