"use client";

import Link from "next/link";
import { User, Heart } from "lucide-react";

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
              className="flex items-center p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
            >
              <User className="h-5 w-5 mr-3" />
              Edit Profile
            </Link>
          </li>
          <li>
            <Link
              href="/admin/saved-homes"
              className="flex items-center p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
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
