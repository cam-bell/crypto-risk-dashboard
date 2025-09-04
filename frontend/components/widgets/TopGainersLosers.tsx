"use client";

import { useRealTimePrice } from "@/hooks/useRealTimePrice";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export function TopGainersLosers() {
  // Use empty array to get general market data
  const { livePrices, getTopPerformers, isLoading } = useRealTimePrice([]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            Top Gainers
          </h3>
          <ListSkeleton items={5} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            Top Losers
          </h3>
          <ListSkeleton items={5} />
        </div>
      </div>
    );
  }

  const { gainers, losers } = getTopPerformers(5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Gainers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          Top Gainers (24h)
        </h3>
        <div className="space-y-3">
          {gainers.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="w-6 h-6 rounded-full mr-3"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {asset.symbol}
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                +{asset.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
          Top Losers (24h)
        </h3>
        <div className="space-y-3">
          {losers.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="w-6 h-6 rounded-full mr-3"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {asset.symbol}
                </span>
              </div>
              <span className="text-sm font-medium text-red-600">
                {asset.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
