"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

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
          </nav>
        </div>

        {/* Right section with auth */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : isLoggedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors bg-[rgb(0,120,130)] text-white hover:bg-[rgb(0,95,103)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(0,120,130)]">
                    {user?.user_metadata
                      ? user.user_metadata.full_name || user.email
                      : user?.email}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button
                      onClick={() => {
                        window.location.href = "/admin/profile";
                      }}
                      className="cursor-pointer w-full text-left"
                    >
                      Profile
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      onClick={() => router.push("/saved-homes")}
                      className="cursor-pointer w-full text-left flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Saved Homes</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
