"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin } from "lucide-react";
import Link from "next/link";

interface FeatureHighlight {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const features: FeatureHighlight[] = [
  {
    icon: Home,
    title: "Find Your Home",
    description:
      "With extensive listings and detailed information, find the perfect house or apartment.",
    ctaText: "Search Homes",
    ctaLink: "/search", // Adjust link as needed
  },
  {
    icon: Search,
    title: "Advanced Search",
    description:
      "Use powerful filters and custom searches to narrow down your options quickly and easily.",
    ctaText: "Refine Search",
    ctaLink: "/search", // Adjust link as needed
  },
  {
    icon: MapPin,
    title: "Explore Locations",
    description:
      "Discover neighborhoods with local insights, amenities, and points of interest.",
    ctaText: "Learn More",
    ctaLink: "#", // Placeholder link, adjust as needed
  },
];

export function FeatureHighlightsSection() {
  return (
    <section className="py-16 bg-[#f7f9fa]">
      <div className="container mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold text-center mb-8">
            See How We Can Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="items-center pb-2">
                  <feature.icon className="h-10 w-10 text-primary mb-3" />
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {feature.description}
                  </p>
                  <Button
                    asChild
                    variant="default"
                    className="rounded-lg font-medium"
                  >
                    <Link href={feature.ctaLink}>{feature.ctaText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
