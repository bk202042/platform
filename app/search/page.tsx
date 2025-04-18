'use client';

import { useSearchParams } from 'next/navigation';
import Container from '@/components/Container';
import PropertySearchForm from '@/components/search/PropertySearchForm';
import PropertySearchResults from '@/components/search/PropertySearchResults';

export default function SearchPage() {
  const searchParams = useSearchParams();
  
  // Convert searchParams to a regular object
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const hasSearchParams = Object.keys(params).length > 0;
  
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Property Search</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-4">
            <PropertySearchForm className="sticky top-8" />
          </div>
          
          {/* Search Results */}
          <div className="lg:col-span-8">
            {hasSearchParams ? (
              <PropertySearchResults searchParams={params} />
            ) : (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Start Your Search</h2>
                <p className="text-muted-foreground">
                  Use the search form to find properties that match your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
