'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { COMMUNITY_CATEGORIES } from '@/lib/validation/community';
import { cn } from '@/lib/utils';

export function CategorySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-56 md:flex-shrink-0">
      <div className="px-4 md:px-0">
        <h2 className="text-lg font-semibold mb-4 hidden md:block">Categories</h2>
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => handleCategoryClick('')}
              className={cn(
                'px-3 py-1 text-sm rounded-full whitespace-nowrap',
                !currentCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              All
            </button>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'px-3 py-1 text-sm rounded-full whitespace-nowrap',
                  currentCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* Desktop: Vertical list */}
        <nav className="hidden md:block">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('');
                }}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium',
                  !currentCategory
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                )}
              >
                All Posts
              </a>
            </li>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(cat);
                  }}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium',
                    currentCategory === cat
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
