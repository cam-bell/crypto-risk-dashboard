"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import { websocketClient } from "@/lib/websocket";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds for real-time data
            gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  // WebSocket connection management
  useEffect(() => {
    const handleConnected = () => {
      console.log("WebSocket connected");
      // Invalidate and refetch queries when WebSocket reconnects
      queryClient.invalidateQueries();
    };

    const handleDisconnected = () => {
      console.log("WebSocket disconnected");
    };

    const handleError = (error: any) => {
      console.error("WebSocket error:", error);
    };

    websocketClient.on("connected", handleConnected);
    websocketClient.on("disconnected", handleDisconnected);
    websocketClient.on("error", handleError);

    return () => {
      websocketClient.off("connected", handleConnected);
      websocketClient.off("disconnected", handleDisconnected);
      websocketClient.off("error", handleError);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CustomThemeProvider>
          <PortfolioProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </PortfolioProvider>
        </CustomThemeProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
