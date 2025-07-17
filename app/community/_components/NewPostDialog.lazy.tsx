'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load the NewPostDialog with a loading fallback
export const LazyNewPostDialog = dynamic(
  () => import('./NewPostDialog.client').then(mod => ({ default: mod.NewPostDialogClient })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">글쓰기 창을 불러오는 중...</span>
      </div>
    ),
    ssr: false, // Disable SSR for this component as it's user-interaction dependent
  }
);
