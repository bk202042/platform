'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PropertyTypeSelector } from '@/components/property/PropertyTypeSelector';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?searchText=${encodeURIComponent(searchText.trim())}`);
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
      <div className="relative z-20 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[600px]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-8 max-w-3xl">
          Discover a place<br />you'll love to live
        </h1>

        {/* Property Type Selector */}
        <PropertyTypeSelector />

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <div className="relative flex items-center">
            <Input
              type="text"
              name="searchText"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by location or property name"
              className="w-full h-14 pl-4 pr-12 text-lg rounded-lg border-2 border-zinc-200 focus:border-primary"
            />
            <Button
              type="submit"
              className="absolute right-0 h-14 w-14 rounded-r-lg flex items-center justify-center bg-primary text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
