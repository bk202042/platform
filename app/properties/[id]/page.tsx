import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/data/property-listing';
import Container from '@/components/Container';

// Import the server component
import PropertyDetailsPage from './page-server';

// This is a simple wrapper that uses the server component
export default function PropertyPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <Container>
        <div className="py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Container>
    }>
      <PropertyDetailsPage params={params} />
    </Suspense>
  );
}

// Generate static params for the most popular properties
export async function generateStaticParams() {
  try {
    // This would typically fetch the most viewed or featured properties
    // For now, we'll just return an empty array
    return [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
