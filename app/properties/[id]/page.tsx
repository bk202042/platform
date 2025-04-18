import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { getPropertyById } from '@/lib/data/property-listing';
import Container from '@/components/Container';

// Import the server component
import PropertyDetailsPage from './page-server';

// Generate metadata for the property details page
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch property details
  const property = await getPropertyById(params.id).catch(() => null);

  // If property doesn't exist, return default metadata
  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist or has been removed.',
    };
  }

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  // Create a description that includes key property details
  const description = `${property.title} - ${formattedPrice} - ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.square_footage} sq ft ${property.property_type === '월세' ? 'monthly rental' : 'for sale'} in ${property.address}.`;

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

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
