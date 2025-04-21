"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PropertyTypeSelector } from "@/components/property/PropertyTypeSelector";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(
        `/search?searchText=${encodeURIComponent(searchText.trim())}`,
      );
    }
  };

  return (
    <section className="relative w-full min-h-[600px] rounded-lg overflow-hidden mb-16">
      {/* Background Image */}
      <div className="absolute inset-0 bg-zinc-900">
        {/* We'll use a placeholder image for now */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative">
            <Image
              src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=2070&auto=format&fit=crop"
              alt="Property in Vietnam"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[600px] text-center">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 max-w-3xl"
          style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)" }}
        >
          Discover a place
          <br />
          you will love to live
        </h1>

        {/* Search Box Container */}
        <div className="bg-white/90 dark:bg-zinc-800/90 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-3xl mt-4">
          {/* Property Type Selector */}
          <PropertyTypeSelector />

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 w-full">
            <div className="relative flex items-center">
              <Input
                type="text"
                name="searchText"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by City, Neighborhood, Zip, Address..."
                className="w-full h-14 pl-4 pr-16 text-lg rounded-lg border-2 border-zinc-300 dark:border-zinc-600 focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                aria-label="Search Location"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-12 w-12 rounded-md flex items-center justify-center bg-primary text-white hover:bg-primary/90"
                aria-label="Submit Search"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
