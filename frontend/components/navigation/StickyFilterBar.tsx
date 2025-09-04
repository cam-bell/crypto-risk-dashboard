"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCw, Filter } from "lucide-react";

interface StickyFilterBarProps {
  portfolioId: string;
}

export function StickyFilterBar({ portfolioId }: StickyFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState(
    searchParams.get("from") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
  );
  const [toDate, setToDate] = useState(
    searchParams.get("to") || new Date().toISOString().split("T")[0]
  );
  const [refreshInterval, setRefreshInterval] = useState(
    Number(searchParams.get("refresh")) || 300
  );
  const [autoRefresh, setAutoRefresh] = useState(
    searchParams.get("auto") === "true"
  );

  // Update URL when filters change
  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
  };

  // Handle date changes
  const handleFromDateChange = (date: string) => {
    setFromDate(date);
    updateURL({ from: date });
  };

  const handleToDateChange = (date: string) => {
    setToDate(date);
    updateURL({ to: date });
  };

  // Handle refresh interval changes
  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    updateURL({ refresh: interval.toString() });
  };

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setAutoRefresh(enabled);
    updateURL({ auto: enabled.toString() });
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    // Trigger a refresh event that components can listen to
    window.dispatchEvent(
      new CustomEvent("portfolio-refresh", {
        detail: { portfolioId, fromDate, toDate },
      })
    );
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleManualRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, portfolioId, fromDate, toDate]);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Portfolio ID Display */}
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Portfolio:
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {portfolioId}
            </span>
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Refresh Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh-filter"
                checked={autoRefresh}
                onChange={(e) => handleAutoRefreshToggle(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="auto-refresh-filter"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Auto-refresh
              </label>
            </div>

            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) =>
                  handleRefreshIntervalChange(Number(e.target.value))
                }
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}

            <button
              onClick={handleManualRefresh}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
