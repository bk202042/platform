"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react"; // Using Home as a placeholder logo icon - Removed Search

export function Header() {
  // Placeholder for authentication status
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" /> {/* Placeholder Logo */}
            <span className="font-bold sm:inline-block">VinaProp</span>{" "}
            {/* Placeholder Name */}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/search"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Search
            </Link>
            <Link
              href="/properties"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Properties
            </Link>
            {/* Add other main navigation links here */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoggedIn ? (
            <>
              {/* Add Saved Homes/Searches icons/links here if needed */}
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm">
              Sign Up / Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
