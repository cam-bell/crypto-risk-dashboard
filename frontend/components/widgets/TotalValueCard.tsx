"use client";

import { usePortfolios } from "@/hooks/usePortfolios";
import { MetricCardWithTrendSkeleton } from "@/components/ui/Skeleton";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export function TotalValueCard() {
  const { portfolios, getPortfolioStats, isLoading } = usePortfolios();

  const portfolioStats = getPortfolioStats();

  if (isLoading) {
    return <MetricCardWithTrendSkeleton />;
  }

  const totalValue = portfolioStats?.totalValue || 0;
  const totalPnl = portfolioStats?.totalPnl || 0;
  const totalPnlPercentage = portfolioStats?.totalPnlPercentage || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Value
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totalValue.toLocaleString()}
          </p>
        </div>
      </div>
      {portfolioStats && (
        <div className="mt-4 flex items-center text-sm">
          {totalPnl >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={totalPnl >= 0 ? "text-green-600" : "text-red-600"}>
            {totalPnl >= 0 ? "+" : ""}
            {totalPnlPercentage.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
