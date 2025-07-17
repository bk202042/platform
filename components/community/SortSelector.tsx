'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Clock, TrendingUp } from 'lucide-react';

export type SortOption = 'latest' | 'popular';

interface SortSelectorProps {
  value?: SortOption;
  onChange?: (sort: SortOption) => void;
  disabled?: boolean;
}

const SORT_OPTIONS = [
  {
    value: 'latest' as const,
    label: '최신순',
    description: '최근에 작성된 글부터',
    icon: Clock,
  },
  {
    value: 'popular' as const,
    label: '인기순',
    description: '7일 내 좋아요가 많은 글부터',
    icon: TrendingUp,
  },
] as const;

export function SortSelector({ value = 'latest', onChange, disabled = false }: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentSort = value || 'latest';
  const currentOption = SORT_OPTIONS.find(option => option.value === currentSort) || SORT_OPTIONS[0];

  const handleSortChange = async (newSort: SortOption) => {
    if (newSort === currentSort || disabled) return;

    setIsLoading(true);

    try {
      // Update URL with new sort parameter
      const params = new URLSearchParams(searchParams.toString());
      if (newSort === 'latest') {
        // Remove sort param for latest (default)
        params.delete('sort');
      } else {
        params.set('sort', newSort);
      }

      // Call onChange callback if provided
      if (onChange) {
        onChange(newSort);
      } else {
        // Navigate with new sort parameter
        router.push(`/community?${params.toString()}`);
      }
    } catch (error) {
      console.error('Failed to change sort:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isLoading}
          className="min-w-[100px] xs:min-w-[110px] sm:min-w-[120px] justify-between text-xs xs:text-sm px-2 xs:px-3 py-1.5 xs:py-2 h-8 xs:h-9 sm:h-10"
          aria-label={`정렬 방식: ${currentOption.label}`}
        >
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
            <currentOption.icon className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs xs:text-sm">{isLoading ? '로딩 중...' : currentOption.label}</span>
          </div>
          <ChevronDown className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 xs:w-52 sm:w-56">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 cursor-pointer"
            disabled={disabled || isLoading}
          >
            <option.icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-xs xs:text-sm">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
            {currentSort === option.value && (
              <div className="ml-auto">
                <div className="h-1.5 w-1.5 xs:h-2 xs:w-2 bg-primary rounded-full" />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
