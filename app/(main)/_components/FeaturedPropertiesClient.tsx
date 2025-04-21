"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Import Carousel components
import {
  Building2,
  Home as HomeIcon,
  MapPin,
  Bed,
  Bath,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/types/property";
import Link from "next/link"; // Import Link

// Animated Tabs component (kept internal to this client component)
function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-8">
      <div className="relative flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-6 py-2 text-sm font-medium transition-all duration-200 z-10",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-primary rounded-md -z-10" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Property Card component (kept internal to this client component)
// Added Link wrapper
function PropertyCard({ property }: { property: PropertyListing }) {
  // NOTE: The PropertyListing type doesn't define 'images'. Using placeholder.
  // NOTE: The PropertyListing type doesn't define 'deposit' or 'monthlyRent'. Using 'price'.
  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={"/placeholder-property.jpg"} // Use placeholder consistently
            alt={property.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            {property.property_type === "월세" ? "For Rent" : "For Sale"}{" "}
            {/* Use property_type */}
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <p className="font-bold text-primary text-lg whitespace-nowrap pl-2">
              {/* Adjust price display based on property_type */}
              {property.property_type === "월세"
                ? `$${property.price.toLocaleString()}/mo` // Assuming price is monthly rent for '월세'
                : `$${property.price.toLocaleString()}`}{" "}
              {/* Assuming price is sale price for '매매' */}
            </p>
          </div>

          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms}</span>
                  <span className="sr-only">Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms}</span>
                  <span className="sr-only">Baths</span>
                </div>
              )}
            </div>
            <div>
              {property.square_footage && `${property.square_footage} ㎡`}{" "}
              {/* Use square_footage */}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Main Client Component for Featured Properties Section
export function FeaturedPropertiesClient({
  rentProperties,
  buyProperties,
  totalProperties,
}: {
  rentProperties: PropertyListing[];
  buyProperties: PropertyListing[];
  totalProperties: number;
}) {
  const [activeTab, setActiveTab] = useState("rent");

  const tabs = [
    { id: "rent", label: "For Rent", icon: <Building2 className="h-4 w-4" /> },
    { id: "buy", label: "For Sale", icon: <HomeIcon className="h-4 w-4" /> },
  ];

  const properties = activeTab === "rent" ? rentProperties : buyProperties;

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Featured Properties
            </h2>
            <p className="text-muted-foreground">
              Discover {totalProperties}+ properties available in Korea
            </p>
          </div>
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Carousel Implementation */}
        <Carousel
          opts={{
            align: "start",
            loop: properties.length > 3, // Loop only if enough items
          }}
          className="w-full"
        >
          <CarouselContent>
            {properties.map((property: PropertyListing) => (
              <CarouselItem
                key={property.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  {" "}
                  {/* Added padding for spacing */}
                  <PropertyCard property={property} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />{" "}
          {/* Hide buttons on small screens initially */}
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/search?propertyType=${activeTab === "rent" ? "월세" : "매매"}`} // Link to search page with filter
            className="group inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            View all properties
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
