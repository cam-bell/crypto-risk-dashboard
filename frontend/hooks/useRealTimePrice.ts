import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useRealTimePrice(assetIds: string[]) {
  // Live prices - 5s stale time for real-time feel
  const {
    data: livePrices,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["live-prices", assetIds.sort().join(",")],
    queryFn: () => apiClient.getLivePrices(assetIds),
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: assetIds.length > 0,
    refetchInterval: 5000, // Refetch every 5 seconds
    placeholderData: (previousData) => previousData,
  });

  // Price history - 1 minute stale time for historical data
  const {
    data: priceHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["price-history", assetIds.sort().join(","), "24h"],
    queryFn: () => apiClient.getPriceHistory(assetIds, "24h"),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: assetIds.length > 0,
    placeholderData: (previousData) => previousData,
  });

  // Market ticker data - 10s stale time
  const {
    data: marketTicker,
    isLoading: tickerLoading,
    error: tickerError,
  } = useQuery({
    queryKey: ["market-ticker"],
    queryFn: () => apiClient.getMarketTicker(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10000, // Refetch every 10 seconds
    placeholderData: (previousData) => previousData,
  });

  // Get price for specific asset
  const getPrice = (assetId: string) => {
    if (!livePrices) return null;
    return livePrices.find((asset) => asset.id === assetId);
  };

  // Get price change percentage
  const getPriceChange = (assetId: string) => {
    const asset = getPrice(assetId);
    if (!asset) return 0;
    return asset.price_change_percentage_24h || 0;
  };

  // Get formatted price
  const getFormattedPrice = (assetId: string, currency = "USD") => {
    const asset = getPrice(assetId);
    if (!asset) return "$0.00";

    const price = asset.current_price || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  // Get market sentiment
  const getMarketSentiment = () => {
    if (!marketTicker) return "neutral";

    const gainers = marketTicker.gainers || 0;
    const losers = marketTicker.losers || 0;
    const total = gainers + losers;

    if (total === 0) return "neutral";

    const ratio = gainers / total;
    if (ratio > 0.6) return "bullish";
    if (ratio < 0.4) return "bearish";
    return "neutral";
  };

  // Get top gainers and losers
  const getTopPerformers = (limit = 5) => {
    if (!livePrices) return { gainers: [], losers: [] };

    const sorted = [...livePrices].sort(
      (a, b) =>
        (b.price_change_percentage_24h || 0) -
        (a.price_change_percentage_24h || 0)
    );

    return {
      gainers: sorted.slice(0, limit),
      losers: sorted.slice(-limit).reverse(),
    };
  };

  return {
    // Data
    livePrices,
    priceHistory,
    marketTicker,

    // Loading states
    isLoading,
    historyLoading,
    tickerLoading,

    // Errors
    error,
    historyError,
    tickerError,

    // Utilities
    refetch,
    getPrice,
    getPriceChange,
    getFormattedPrice,
    getMarketSentiment,
    getTopPerformers,
  };
}
