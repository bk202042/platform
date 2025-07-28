"use client";

import React, { useEffect } from "react";
import {
  registerServiceWorker,
  useNetworkStatus,
  useServiceWorkerUpdate,
} from "@/lib/utils/service-worker";
import { toast } from "sonner";

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOnline = useNetworkStatus();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Network status tracking (notifications removed for better UX)
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Network status is now handled silently - users can see offline status via NetworkStatusIndicator
  }, [isOnline]);

  // Show update notification
  useEffect(() => {
    if (updateAvailable) {
      toast.info("새로운 버전이 사용 가능합니다.", {
        action: {
          label: "업데이트",
          onClick: applyUpdate,
        },
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [updateAvailable, applyUpdate]);

  return <>{children}</>;
}

// Network status indicator component
export function NetworkStatusIndicator() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
      오프라인 모드 - 일부 기능이 제한될 수 있습니다
    </div>
  );
}
