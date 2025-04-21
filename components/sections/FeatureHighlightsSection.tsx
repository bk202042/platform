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
    <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
          See How We Can Help
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center bg-white dark:bg-zinc-800 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="items-center">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                  {feature.description}
                </p>
                <Button asChild variant="default">
                  <Link href={feature.ctaLink}>{feature.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
