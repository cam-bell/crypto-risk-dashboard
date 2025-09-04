"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
// WebSocket removed for now

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds default
            gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000),
            refetchOnWindowFocus: false, // Prevent refetch on focus
            refetchOnReconnect: true,
            refetchOnMount: false, // Don't refetch on mount if cached data exists
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  // Data refresh management - intelligent invalidation based on data type
  useEffect(() => {
    // Price data - refresh every 5 seconds for real-time feel
    const priceInterval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["prices"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["live-prices"],
        exact: false,
      });
    }, 5000);

    // Portfolio and risk data - refresh every 30 seconds
    const portfolioInterval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio-live-data"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-metrics"],
        exact: false,
      });
    }, 30000);

    // Market data - refresh every 60 seconds
    const marketInterval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["market-data"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["market-sentiment"],
        exact: false,
      });
    }, 60000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(portfolioInterval);
      clearInterval(marketInterval);
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
