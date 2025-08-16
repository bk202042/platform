"use client";

import Link from "next/link";
import { User, Heart, FileText } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

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
    <aside className="w-56 border-r bg-white h-full sticky top-0 flex flex-col items-center py-8">
      <div className="flex flex-col items-center mb-8">
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
  );
}
