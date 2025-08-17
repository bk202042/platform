"use client";

import Link from "next/link";
import { User, Heart, FileText, Menu, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'profile';
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Helper function to get active state
  const getNavItemClasses = (path: string, section?: string) => {
    const isActive = pathname === path && (!section || currentSection === section);
    return `flex items-center p-3 rounded-lg transition-colors w-full ${
      isActive 
        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Overlay - Only visible when drawer is open on mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop, drawer on mobile */}
      <aside 
        className={`
          w-56 bg-white min-h-screen flex flex-col items-center py-8
          md:sticky md:top-0 md:translate-x-0
          fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ borderRight: '1px solid #CFCFCF' }}
      >
        {/* Close button - Only visible on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        <div className="flex flex-col items-center mb-8 mt-8 md:mt-0">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 mb-2">
            {fullName[0]}
          </div>
          <div className="font-semibold text-base text-center break-all">
            {fullName}
          </div>
        </div>
        <nav className="w-full">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/profile"
                className={getNavItemClasses('/admin/profile', 'profile')}
              >
                <User className="h-5 w-5 mr-3" />
                Edit Profile
              </Link>
            </li>
            <li>
              <Link
                href="/admin/profile?section=posts"
                className={getNavItemClasses('/admin/profile', 'posts')}
              >
                <FileText className="h-5 w-5 mr-3" />
                내 게시글
              </Link>
            </li>
            <li>
              <Link
                href="/admin/saved-homes"
                className={getNavItemClasses('/admin/saved-homes')}
              >
                <Heart className="h-5 w-5 mr-3" />
                Saved Homes
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
