"use client";

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
      "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?q=80&w=3023&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    propertyCount: 18,
  },
  {
    name: "Hai Phong",
    imageUrl:
      "https://images.unsplash.com/photo-1570559120097-e6c3388329e6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    propertyCount: 14,
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
      "https://images.unsplash.com/photo-1558334466-afce6bf36c69?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    propertyCount: 6,
  },
];

export function ExploreSection() {
  return (
    <section className="container mx-auto px-4 mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">베트남 집 둘러보기</h2>
        <p className="text-lg text-muted-foreground max-w-3xl">
          매물, 동네 사진, 후기, 현지 정보로 딱 맞는 집을 찾아보세요.
        </p>
      </div>

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city, index) => (
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
