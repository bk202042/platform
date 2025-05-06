"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface CitiesData {
  name: string;
  imageUrl: string;
  propertyCount: number;
}

const cities: CitiesData[] = [
  {
    name: "Ho Chi Minh City",
    imageUrl:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop",
    propertyCount: 24,
  },
  {
    name: "Hanoi",
    imageUrl:
      "https://images.unsplash.com/photo-1599708153386-62bf3489c821?q=80&w=2070&auto=format&fit=crop",
    propertyCount: 18,
  },
  {
    name: "Da Nang",
    imageUrl:
      "https://images.unsplash.com/photo-1564596823821-79b97151055e?q=80&w=2070&auto=format&fit=crop",
    propertyCount: 12,
  },
  {
    name: "Nha Trang",
    imageUrl:
      "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=2070&auto=format&fit=crop",
    propertyCount: 8,
  },
  {
    name: "Hoi An",
    imageUrl:
      "https://images.unsplash.com/photo-1558185348-c1e6420aa7d8?q=80&w=2070&auto=format&fit=crop",
    propertyCount: 6,
  },
];

export function ExploreSection() {
  return (
    <section className="container mx-auto px-4 mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Explore homes in Vietnam</h2>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Take a deep dive and browse homes for sale, original neighborhood
          photos, resident reviews and local insights to find what is right for
          you.
        </p>
      </div>

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* City Card 1 */}
        <CityCard
          name={cities[0].name}
          imageUrl={cities[0].imageUrl}
          propertyCount={cities[0].propertyCount}
        />

        {/* Placeholder Card */}
        <Card className="p-6 flex flex-col justify-center items-center h-full bg-muted">
          {/* Empty placeholder for future content */}
        </Card>

        {/* Remaining City Cards */}
        {cities.slice(1).map((city, index) => (
          <CityCard
            key={index}
            name={city.name}
            imageUrl={city.imageUrl}
            propertyCount={city.propertyCount}
          />
        ))}
      </div>
    </section>
  );
}

interface CityCardProps {
  name: string;
  imageUrl: string;
  propertyCount: number;
}

function CityCard({ name, imageUrl, propertyCount }: CityCardProps) {
  return (
    <Link
      href={`/search?city=${encodeURIComponent(name)}`}
      className="block h-full"
    >
      <div className="relative rounded-lg overflow-hidden h-full min-h-[240px] group">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* City Name and Property Count */}
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-sm text-white/80">{propertyCount} properties</p>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white flex items-center space-x-2">
            <span className="font-medium">View Homes</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
