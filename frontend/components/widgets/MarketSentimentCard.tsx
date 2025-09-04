"use client";

import { useRealTimePrice } from "@/hooks/useRealTimePrice";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export function MarketSentimentCard() {
  // Use empty array to get general market data
  const { marketTicker, getMarketSentiment, isLoading } = useRealTimePrice([]);

  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  const sentiment = getMarketSentiment();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-500";
      case "bearish":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "BULLISH";
      case "bearish":
        return "BEARISH";
      default:
        return "NEUTRAL";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Market Sentiment
          </p>
          <div className="flex items-center mt-1">
            {getSentimentIcon(sentiment)}
            <span
              className={`ml-2 text-lg font-bold ${getSentimentColor(sentiment)}`}
            >
              {getSentimentLabel(sentiment)}
            </span>
          </div>
        </div>
      </div>
      {marketTicker && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {marketTicker.gainers || 0} gainers, {marketTicker.losers || 0} losers
        </div>
      )}
    </div>
  );
}
