"use client";

import { useState, useEffect } from "react";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useCryptoAssets } from "@/hooks/useCryptoAssets";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import Link from "next/link";
import { PortfolioCreationModal } from "./PortfolioCreationModal";
import { TotalValueCard } from "./widgets/TotalValueCard";
import { OverallRiskCard } from "./widgets/OverallRiskCard";
import { MarketSentimentCard } from "./widgets/MarketSentimentCard";
import { ActivePortfoliosCard } from "./widgets/ActivePortfoliosCard";
import { TopGainersLosers } from "./widgets/TopGainersLosers";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ArrowRight } from "lucide-react";

export function DashboardOverview() {
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes default
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    portfolios,
    isLoading: portfoliosLoading,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
    realTimeData: portfolioRealTime,
  } = usePortfolios();

  const {
    assets,
    isLoading: assetsLoading,
    getTopGainers,
    getTopLosers,
    getHighestVolume,
    getMarketSentiment,
    getPriceChangeStats,
    realTimeData: assetsRealTime,
  } = useCryptoAssets();

  const {
    useRiskMetrics: usePortfolioRiskMetrics,
    calculateRiskScore,
    getRiskLevel,
    getRiskSummary,
  } = useRiskMetrics();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger refetch of key data
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const portfolioStats = getPortfolioStats();
  const topPerformers = getTopPerformers(5);
  const highestRisk = getHighestRisk(5);

  const handleCreatePortfolio = (portfolioData: {
    name: string;
    description: string;
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>;
  }) => {
    // For now, we'll just log the portfolio data
    // In a real app, this would call an API to create the portfolio
    console.log("Creating portfolio:", portfolioData);

    // You can implement the actual portfolio creation logic here
    // For example, call a mutation hook or API endpoint

    // For demo purposes, we'll show an alert
    alert(
      `Portfolio "${portfolioData.name}" created successfully with ${portfolioData.assets.length} assets!`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Connection Status */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crypto Risk Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time portfolio monitoring and risk analysis
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="auto-refresh"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Auto-refresh
                </label>
              </div>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TotalValueCard />
          <OverallRiskCard />
          <MarketSentimentCard />
          <ActivePortfoliosCard />
        </div>

        {/* Portfolio Quick Access */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Portfolios
            </h2>
            <Link
              href="/portfolios"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfoliosLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                  >
                    <ListSkeleton items={1} />
                  </div>
                ))
              : portfolios.slice(0, 6).map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    href={`/portfolios/${portfolio.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {portfolio.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${portfolio.total_value.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
          </div>
        </div>

        {/* Market Overview */}
        <TopGainersLosers />
      </div>

      {/* Portfolio Creation Modal */}
      <PortfolioCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePortfolio={handleCreatePortfolio}
      />
    </div>
  );
}
