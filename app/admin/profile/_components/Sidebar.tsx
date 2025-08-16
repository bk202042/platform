"use client";

import { User, FileText } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      role?: string;
    };
  };
  currentSection: string;
}

export function Sidebar({ user, currentSection }: SidebarProps) {
  const fullName = user.user_metadata?.full_name || user.email || "사용자";
  const userType = "Home Buyer"; // Similar to Trulia's user type display

  const menuItems = [
    {
      id: "profile",
      label: "프로필 편집",
      icon: User,
      href: "/admin/profile?section=profile",
    },
    {
      id: "posts",
      label: "내 게시글",
      icon: FileText,
      href: "/admin/profile?section=posts",
    },
  ];

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-40">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 flex-shrink-0">
            {fullName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-gray-900 truncate">{fullName}</h2>
            <p className="text-xs text-gray-500 truncate">{userType}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}