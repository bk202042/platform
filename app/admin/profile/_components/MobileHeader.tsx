"use client";

import { useState } from "react";
import { Menu, X, User, FileText } from "lucide-react";
import Link from "next/link";

interface MobileHeaderProps {
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

export function MobileHeader({ user, currentSection }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fullName = user.user_metadata?.full_name || user.email || "사용자";

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

  const getCurrentSectionLabel = () => {
    const currentItem = menuItems.find(item => item.id === currentSection);
    return currentItem?.label || "프로필";
  };

  return (
    <>
      {/* Mobile Header - Fixed at top, only visible on mobile */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left side - Menu button and current section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {getCurrentSectionLabel()}
            </h1>
          </div>

          {/* Right side - User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {fullName[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-60">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 flex-shrink-0">
                  {fullName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium text-gray-900 truncate">{fullName}</h2>
                  <p className="text-xs text-gray-500 truncate">Home Buyer</p>
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
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
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
        </div>
      )}
    </>
  );
}