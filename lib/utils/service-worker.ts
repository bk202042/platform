// Service Worker registration and management utilities

import React from "react";
import { measurePerformance } from "./performance";

// Service Worker registration with performance monitoring
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise<ServiceWorkerRegistration | null>((resolve) => {
    window.addEventListener("load", async () => {
      try {
        measurePerformance("service-worker-registration", async () => {
          const registration = await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
              updateViaCache: "imports",
            }
          );

          console.log("Service Worker registered successfully:", registration);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker is available
                  showUpdateNotification();
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            handleServiceWorkerMessage(event);
          });

          resolve(registration);
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        resolve(null);
      }
    });
  });
}

// Handle service worker messages
function handleServiceWorkerMessage(event: MessageEvent) {
  const { data } = event;

  switch (data?.type) {
    case "CACHE_UPDATED":
      console.log("Cache updated by service worker");
      // Dispatch custom event for components to listen to
      window.dispatchEvent(
        new CustomEvent("sw-cache-updated", { detail: data })
      );
      break;
    case "OFFLINE_READY":
      console.log("App is ready for offline use");
      window.dispatchEvent(new CustomEvent("sw-offline-ready"));
      break;
    case "UPDATE_AVAILABLE":
      console.log("Update available");
      window.dispatchEvent(new CustomEvent("sw-update-available"));
      break;
    default:
      console.log("Service worker message:", data);
  }
}

function showUpdateNotification() {
  // Show a notification to the user that an update is available
  if (confirm("새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?")) {
    // Tell the service worker to skip waiting
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }

    // Reload the page
    window.location.reload();
  }
}

// Utility to check if the app is running offline
export function isOnline(): boolean {
  return navigator.onLine;
}

// Utility to listen for online/offline events
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  if (typeof window === "undefined") return;

  const handleOnline = () => {
    console.log("App is online");
    onOnline?.();
  };

  const handleOffline = () => {
    console.log("App is offline");
    onOffline?.();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// Utility to force cache update
export function updateServiceWorkerCache() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CACHE_UPDATE" });
  }
}

// Utility to check for service worker updates
export async function checkForUpdates() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  } catch (error) {
    console.error("Failed to check for updates:", error);
  }
}

// React hook for network status
export function useNetworkStatus() {
  const [isOnlineStatus, setIsOnlineStatus] = React.useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  React.useEffect(() => {
    const cleanup = setupNetworkListeners(
      () => setIsOnlineStatus(true),
      () => setIsOnlineStatus(false)
    );

    return cleanup;
  }, []);

  return isOnlineStatus;
}

// React hook for service worker updates
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [registration, setRegistration] =
    React.useState<ServiceWorkerRegistration | null>(null);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      }
    });
  }, []);

  const applyUpdate = React.useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [registration]);

  return { updateAvailable, applyUpdate };
}


