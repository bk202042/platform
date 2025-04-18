'use client';

import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function PropertyDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}
