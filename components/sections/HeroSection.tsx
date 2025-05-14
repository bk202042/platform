"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(
        `/search?searchText=${encodeURIComponent(searchText.trim())}&type=${activeTab}`,
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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 max-w-3xl leading-tight drop-shadow-md">
          살고 싶은 곳을
          <br />
          발견하세요
        </h1>

        {/* Search Box Container */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          {/* Toggle Buttons */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("buy")}
              className={`flex-1 py-4 text-lg font-medium transition-colors ${
                activeTab === "buy"
                  ? "text-[#007882] border-b-2 border-[#007882]"
                  : "text-[#2A2A33] hover:text-[#007882]"
              }`}
            >
              매매
            </button>
            <button
              onClick={() => setActiveTab("rent")}
              className={`flex-1 py-4 text-lg font-medium transition-colors ${
                activeTab === "rent"
                  ? "text-[#007882] border-b-2 border-[#007882]"
                  : "text-[#2A2A33] hover:text-[#007882]"
              }`}
            >
              월세
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative flex items-center">
              <Input
                type="text"
                name="searchText"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="위치를 입력하세요"
                className="w-full h-14 pl-4 pr-16 text-lg rounded-lg border-2 border-gray-200 focus:border-[#007882] focus:ring-[#007882] placeholder:text-gray-500"
                aria-label="Search Location"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-[#E95C33] hover:bg-[#D14A21] text-white"
                aria-label="Submit Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
