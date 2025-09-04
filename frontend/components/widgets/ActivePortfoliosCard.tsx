"use client";

import { usePortfolios } from "@/hooks/usePortfolios";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import { Wallet } from "lucide-react";

export function ActivePortfoliosCard() {
  const { portfolios, isLoading } = usePortfolios();

  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  const activePortfolios = portfolios.filter(
    (portfolio) => portfolio.total_value > 0 || portfolio.holdings.length > 0
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Portfolios
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activePortfolios.length}
          </p>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {activePortfolios.length > 0 ? (
          <>
            {activePortfolios.length} active out of {portfolios.length} total
          </>
        ) : (
          "No active portfolios"
        )}
      </div>
    </div>
  );
}
