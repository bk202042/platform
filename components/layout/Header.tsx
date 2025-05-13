"use client";

import Link from "next/link";
import { Home, Heart, User } from "lucide-react";
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

interface UserWithMetadata {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserWithMetadata | null>(null);
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
            <span className="text-[#2A2A33] text-xl font-bold">VinaHome</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/search"
              className="px-3 py-2 font-medium text-sm text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded transition-colors"
            >
              매매
            </Link>
            <Link
              href="/properties"
              className="px-3 py-2 font-medium text-sm text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded transition-colors"
            >
              임대
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
                    <User className="h-5 w-5" />
                    <span>
                      {user &&
                      typeof user === "object" &&
                      "user_metadata" in user &&
                      user.user_metadata
                        ? user.user_metadata.full_name || user.email
                        : user?.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button
                      onClick={() => router.push("/admin/profile")}
                      className="cursor-pointer w-full text-left"
                    >
                      프로필
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      onClick={() => router.push("/admin/saved-homes")}
                      className="cursor-pointer w-full text-left flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>저장된 매물</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleSignOut}
                  >
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <button className="px-3 py-2 font-medium text-sm text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded transition-colors">
                  로그인
                </button>
              </Link>
              <Link href="/auth/sign-up">
                <button className="px-3 py-2 font-medium text-sm text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded transition-colors">
                  회원가입
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
