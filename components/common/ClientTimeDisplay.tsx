"use client";

import { useState, useEffect } from "react";
import { formatKoreanTime, getTimeTooltip } from "@/lib/utils/time";

interface ClientTimeDisplayProps {
  dateString: string;
  className?: string;
}

/**
 * Client-only time display component to prevent hydration mismatches
 * Shows a static fallback during SSR, then hydrates with real-time formatting
 */
export function ClientTimeDisplay({ dateString, className }: ClientTimeDisplayProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [timeTooltip, setTimeTooltip] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeAgo(formatKoreanTime(dateString));
    setTimeTooltip(getTimeTooltip(dateString));
  }, [dateString]);

  // During SSR and initial render, show a static fallback
  if (!isClient) {
    return (
      <span className={className}>
        방금 전
      </span>
    );
  }

  // After hydration, show the real time
  return (
    <span className={className} title={timeTooltip}>
      {timeAgo}
    </span>
  );
}