import { notFound } from "next/navigation";
import { getPropertyById, getSimilarProperties } from "@/lib/data/property";
import PropertyDetail from "./_components/PropertyDetail";
import PropertyGallery from "./_components/PropertyGallery";
import PropertyFeatures from "./_components/PropertyFeatures";
import PropertyCosts from "./_components/PropertyCosts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Heart, Mail, Phone } from "lucide-react";

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    return {
      title: "Property Not Found",
      description: "The requested property could not be found",
    };
  }

  return {
    title: `${property.title} | Vietnam Property Platform`,
    description: property.description.substring(0, 160),
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery property={property} />

            {/* Property details */}
            <PropertyDetail property={property} />

            {/* Features */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Property Features</h2>
              <PropertyFeatures property={property} />
            </div>
          </div>

          {/* Right column - Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact card */}
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold">
                        ${property.price.toLocaleString()}
                        {property.property_type === "월세" ? "/month" : ""}
                      </h3>
                      <p className="text-muted-foreground">
                        {property.property_type === "월세"
                          ? "Monthly Rent (월세)"
                          : "Purchase (매매)"}
                      </p>
                    </div>
                    <Button variant="outline" size="icon">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full" size="lg">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Agent
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      +84 123 456 789
                    </Button>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">John Doe</p>
                    <p className="text-muted-foreground">Licensed Real Estate Agent</p>
                    <p className="text-muted-foreground">john.doe@example.com</p>
                  </div>
                </div>
              </Card>

              {/* Costs breakdown */}
              <PropertyCosts property={property} />

              {/* Similar properties */}
              {similarProperties.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Similar Properties</h3>
                  <div className="space-y-4">
                    {similarProperties.map((similarProperty) => (
                      <Link
                        key={similarProperty.id}
                        href={`/properties/${similarProperty.id}`}
                        className="block"
                      >
                        <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
                          <h4 className="font-medium line-clamp-1">
                            {similarProperty.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {similarProperty.address}
                          </p>
                          <p className="font-medium mt-2">
                            ${similarProperty.price.toLocaleString()}
                            {similarProperty.property_type === "월세" ? "/month" : ""}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
