"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, User, Heart } from "lucide-react";

export function Header() {
  // Placeholder for authentication status
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section with logo and nav */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-[#007882]" />
            <span className="text-[#2A2A33] text-xl font-bold">VinaProp</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/search"
              className="text-[#2A2A33] hover:text-[#007882] transition-colors font-medium"
            >
              Buy
            </Link>
            <Link
              href="/properties"
              className="text-[#2A2A33] hover:text-[#007882] transition-colors font-medium"
            >
              Rent
            </Link>
            <Link
              href="/mortgage"
              className="text-[#2A2A33] hover:text-[#007882] transition-colors font-medium"
            >
              Mortgage
            </Link>
          </nav>
        </div>

        {/* Right section with auth */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                className="text-[#2A2A33] hover:text-[#007882] hidden md:flex items-center space-x-2"
              >
                <Heart className="h-5 w-5" />
                <span>Saved Homes</span>
              </Button>
              <Button
                variant="ghost"
                className="text-[#2A2A33] hover:text-[#007882]"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  className="text-[#2A2A33] hover:text-[#007882] font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#007882] hover:bg-[#005F67] text-white font-medium">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
