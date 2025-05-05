"use client";

import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Building2,
  Home as HomeIcon,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/types/property";
import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";

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
                  <PropertyCard property={property} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/search?propertyType=${activeTab === "rent" ? "월세" : "매매"}`}
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
