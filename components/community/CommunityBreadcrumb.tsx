import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { CommunityCategory } from '@/lib/validation/community';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CommunityBreadcrumbProps {
  items?: BreadcrumbItem[];
  postTitle?: string;
  category?: CommunityCategory;
}

// Category labels in Korean
const CATEGORY_LABELS = {
  QNA: 'Q&A',
  RECOMMEND: '추천',
  SECONDHAND: '중고거래',
  FREE: '나눔',
} as const;

export function CommunityBreadcrumb({ items, postTitle, category }: CommunityBreadcrumbProps) {
  // Build default breadcrumb items
  const defaultItems: BreadcrumbItem[] = [
    { label: '홈', href: '/' },
    { label: '커뮤니티', href: '/community' },
  ];

  // Add category if provided
  if (category) {
    defaultItems.push({
      label: CATEGORY_LABELS[category],
      href: `/community?category=${category.toLowerCase()}`
    });
  }

  // Add post title if provided (current page, no link)
  if (postTitle) {
    defaultItems.push({
      label: postTitle.length > 30 ? `${postTitle.slice(0, 30)}...` : postTitle
    });
  }

  const breadcrumbItems = items || defaultItems;

  return (
    <nav aria-label="페이지 경로" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index === 0 && (
              <Home size={16} className="text-gray-400" aria-hidden="true" />
            )}

            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            )}

            {index < breadcrumbItems.length - 1 && (
              <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
