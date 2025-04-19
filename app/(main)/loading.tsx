import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton';
import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section Skeleton */}
      <section className="relative w-full min-h-[600px] rounded-lg overflow-hidden mb-16 bg-muted animate-pulse">
        <div className="relative z-20 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[600px]">
          <div className="h-16 bg-muted-foreground/20 rounded-lg w-3/4 max-w-2xl mb-8"></div>
          <div className="h-12 bg-muted-foreground/20 rounded-lg w-1/2 max-w-xl mb-8"></div>
          <div className="h-14 bg-muted-foreground/20 rounded-lg w-full max-w-2xl"></div>
        </div>
      </section>

      {/* Explore Section Skeleton */}
      <section className="container mx-auto px-4 mb-16">
        <div className="mb-8">
          <div className="h-10 bg-muted rounded-md w-1/3 animate-pulse mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse"></div>
        </div>

        {/* City Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[240px] bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>

      {/* Featured Properties Section Skeleton */}
      <section className="container mx-auto px-4 mb-16">
        <div className="mb-8">
          <div className="h-10 bg-muted rounded-md w-1/3 animate-pulse mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse"></div>
        </div>

        <div className="mb-8">
          <div className="h-10 bg-muted rounded-md w-full animate-pulse"></div>
        </div>

        {/* Property Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>

        {/* Property Statistics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6 flex items-center animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-full mr-4"></div>
              <div>
                <div className="h-8 bg-muted rounded-md w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-24"></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Korean Expatriates Section Skeleton */}
      <section className="bg-muted py-12 px-4 rounded-lg mb-16">
        <div className="container mx-auto">
          <div className="h-8 bg-muted-foreground/20 rounded-md w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded-md w-1/2 mx-auto mb-6"></div>
          <div className="h-10 bg-muted-foreground/20 rounded-md w-32 mx-auto"></div>
        </div>
      </section>
    </div>
  );
}
