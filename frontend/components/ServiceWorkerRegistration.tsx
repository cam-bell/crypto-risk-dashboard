"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Download, CheckCircle, XCircle, Bell, BellOff } from "lucide-react";

export function ServiceWorkerRegistration() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check online status
    setIsOnline(navigator.onLine);

    // Register service worker
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);

      // Listen for service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              showUpdateNotification();
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    setDeferredPrompt(event);
    setShowInstallPrompt(true);
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    setShowInstallPrompt(false);
    toast.success("App installed successfully!");
  };

  const handleOnline = () => {
    setIsOnline(true);
    toast.success("You are back online!");
  };

  const handleOffline = () => {
    setIsOnline(false);
    toast.error("You are offline. Some features may not work.");
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
      case "background-sync-complete":
        if (payload.success) {
          toast.success(
            `Background sync completed. ${payload.syncedActions} actions synced.`
          );
        } else {
          toast.error(`Background sync failed: ${payload.error}`);
        }
        break;

      default:
        console.log("Service Worker message:", type, payload);
    }
  };

  const showUpdateNotification = () => {
    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-blue-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  Update Available
                </p>
                <p className="mt-1 text-sm text-white">
                  A new version is available. Refresh to update.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-blue-700">
            <button
              onClick={() => {
                window.location.reload();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Update
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast.success("Notifications enabled!");

        // Subscribe to push notifications
        if ("serviceWorker" in navigator && "PushManager" in window) {
          subscribeToPushNotifications();
        }
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      toast.error("Failed to enable notifications");
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      console.log("Push notification subscription:", subscription);

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log("Unsubscribed from push notifications");

        // Notify server
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      toast.error("Failed to disable push notifications");
    }
  };

  const clearCache = async () => {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        toast.success("Cache cleared successfully");
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Failed to clear cache");
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Download className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Install App
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Install this app for a better experience
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-500 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="fixed top-4 right-4 flex items-center space-x-2 z-40">
        {/* Online Status */}
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            isOnline
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {isOnline ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Notification Permission */}
        {notificationPermission === "default" && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs hover:bg-yellow-200 dark:hover:bg-yellow-800"
          >
            <Bell className="w-3 h-3" />
            <span>Enable Notifications</span>
          </button>
        )}

        {notificationPermission === "granted" && (
          <button
            onClick={unsubscribeFromPushNotifications}
            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-800"
          >
            <Bell className="w-3 h-3" />
            <span>Notifications Enabled</span>
          </button>
        )}

        {notificationPermission === "denied" && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs">
            <BellOff className="w-3 h-3" />
            <span>Notifications Blocked</span>
          </div>
        )}

        {/* Cache Control */}
        <button
          onClick={clearCache}
          className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Clear cache"
        >
          Clear Cache
        </button>
      </div>
    </>
  );
}
