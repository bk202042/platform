"use client";

import Link from "next/link";
import { Home, Heart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section with logo and nav */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-[#007882]" />
            <span className="text-[#2A2A33] text-xl font-medium">VinaHome</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/search"
              className="px-4 py-2 font-medium text-base text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
            >
              매매
            </Link>
            <Link
              href="/properties"
              className="px-4 py-2 font-medium text-base text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
            >
              임대
            </Link>
            <Link
              href="/community"
              className="px-4 py-2 font-medium text-base text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
            >
              커뮤니티
            </Link>
          </nav>
        </div>

        {/* Right section with auth and mobile menu */}
        <div className="flex items-center space-x-6">
          {/* User Authentication */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-4 py-2 font-medium text-base text-[#2A2A33] hover:bg-[#007882] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007882]"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user.user_metadata?.full_name || user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/profile")}
                      className="cursor-pointer w-full text-left"
                    >
                      프로필
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/profile?section=posts")}
                      className="cursor-pointer w-full text-left"
                    >
                      내 게시글
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/saved-homes")}
                      className="cursor-pointer w-full text-left flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      <span>저장된 매물</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      type="button"
                      onClick={() => router.push("/admin/saved-searches")}
                      className="cursor-pointer w-full text-left"
                    >
                      저장된 검색
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
            ) : (
              <>
                <Link href="/auth/sign-in" className="hidden sm:block">
                  <button
                    type="button"
                    className="px-1 py-2 font-medium text-base text-[#2A2A33] hover:text-[#007882] transition-colors duration-200"
                  >
                    로그인
                  </button>
                </Link>
                <Link href="/auth/sign-up" className="hidden sm:block">
                  <button
                    type="button"
                    className="px-4 py-2 font-medium text-base bg-[#007882] text-white hover:bg-[#005f66] rounded-lg transition-colors duration-200"
                  >
                    회원가입
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Positioned on far right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="p-2 text-[#2A2A33] hover:text-[#007882] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#007882] transition-all duration-200"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Menu Panel */}
          <div 
            id="mobile-menu"
            className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 transform transition-all duration-200 ease-out"
            role="navigation"
            aria-labelledby="mobile-menu-button"
          >
            <nav className="px-6 py-4 space-y-2">
              {/* Main Navigation */}
              <Link
                href="/search"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
              >
                매매
              </Link>
              <Link
                href="/properties"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
              >
                임대
              </Link>
              <Link
                href="/community"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-[#2A2A33] hover:bg-[#007882] hover:text-white rounded-md transition-all duration-200"
              >
                커뮤니티
              </Link>
              
              {/* Mobile-specific sections */}
              {!loading && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  {user ? (
                    <div className="space-y-2">
                      {/* User Profile Section */}
                      <div>
                        <div className="px-2 py-2 text-sm text-gray-600">
                          {user.user_metadata?.full_name || user.email}
                        </div>
                        <Link
                          href="/admin/profile"
                          onClick={closeMobileMenu}
                          className="block px-2 py-3 text-base font-medium text-[#2A2A33] hover:text-[#007882] transition-colors"
                        >
                          프로필
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            closeMobileMenu();
                          }}
                          className="block w-full text-left px-2 py-3 text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/auth/sign-in"
                        onClick={closeMobileMenu}
                        className="block px-2 py-3 text-base font-medium text-[#2A2A33] hover:text-[#007882] transition-colors"
                      >
                        로그인
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        onClick={closeMobileMenu}
                        className="block px-2 py-3 text-base font-medium bg-[#007882] text-white hover:bg-[#005f66] rounded-lg transition-colors text-center"
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
