import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CryptoAsset, PriceHistory } from "@/types";
import { useRealTimeData } from "./useRealTimeData";
import { websocketClient } from "@/lib/websocket";
import { toast } from "react-hot-toast";

export function useCryptoAssets() {
  const queryClient = useQueryClient();

  // Real-time data subscription for price updates
  const realTimeData = useRealTimeData({
    enablePriceUpdates: true,
    showNotifications: false, // Don't show notifications for price updates
  });

  // Get all crypto assets
  const {
    data: assets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["crypto-assets"],
    queryFn: apiClient.getCryptoAssets,
    staleTime: 15 * 1000, // 15 seconds for real-time price updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute as fallback
  });

  // Get single crypto asset
  const useCryptoAsset = (id: string) => {
    return useQuery({
      queryKey: ["crypto-asset", id],
      queryFn: () => apiClient.getCryptoAsset(id),
      staleTime: 10 * 1000, // 10 seconds for real-time updates
      enabled: !!id,
    });
  };

  // Get asset with enhanced metrics
  const useAssetMetrics = (id: string) => {
    return useQuery({
      queryKey: ["asset-metrics", id],
      queryFn: () => apiClient.getAssetMetrics(id),
      staleTime: 30 * 1000, // 30 seconds for metrics
      enabled: !!id,
    });
  };

  // Get price history
  const usePriceHistory = (assetId: string, timeframe: string = "24h") => {
    return useQuery({
      queryKey: ["price-history", assetId, timeframe],
      queryFn: () => apiClient.getPriceHistory(assetId, timeframe),
      staleTime: 60 * 1000, // 1 minute for historical data
      enabled: !!assetId,
    });
  };

  // Get live prices for specific assets
  const useLivePrices = (assetIds: string[]) => {
    return useQuery({
      queryKey: ["live-prices", assetIds.sort().join(",")],
      queryFn: () => apiClient.getLivePrices(assetIds),
      staleTime: 5 * 1000, // 5 seconds for live prices
      enabled: assetIds.length > 0,
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
  };

  // Get market ticker
  const useMarketTicker = () => {
    return useQuery({
      queryKey: ["market-ticker"],
      queryFn: apiClient.getMarketTicker,
      staleTime: 10 * 1000, // 10 seconds for market data
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
  };

  // Get market overview
  const useMarketOverview = () => {
    return useQuery({
      queryKey: ["market-overview"],
      queryFn: apiClient.getMarketOverview,
      staleTime: 60 * 1000, // 1 minute for market overview
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
  };

  // Get market trends
  const useMarketTrends = (timeframe: string = "24h") => {
    return useQuery({
      queryKey: ["market-trends", timeframe],
      queryFn: () => apiClient.getMarketTrends(timeframe),
      staleTime: 5 * 60 * 1000, // 5 minutes for trends
      refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    });
  };

  // Search assets
  const useSearchAssets = (query: string) => {
    return useQuery({
      queryKey: ["search-assets", query],
      queryFn: () => apiClient.searchAssets(query),
      staleTime: 5 * 60 * 1000, // 5 minutes for search results
      enabled: query.length >= 2,
    });
  };

  // Get search suggestions
  const useSearchSuggestions = (query: string) => {
    return useQuery({
      queryKey: ["search-suggestions", query],
      queryFn: () => apiClient.getSearchSuggestions(query),
      staleTime: 10 * 60 * 1000, // 10 minutes for suggestions
      enabled: query.length >= 1,
    });
  };

  // Watchlist management
  const useWatchlist = () => {
    return useQuery({
      queryKey: ["watchlist"],
      queryFn: () => {
        const watchlistIds = JSON.parse(
          localStorage.getItem("watchlist") || "[]"
        );
        return assets.filter((asset) => watchlistIds.includes(asset.id));
      },
      staleTime: 0, // Always fresh from assets cache
      enabled: assets.length > 0,
    });
  };

  // Add to watchlist
  const addToWatchlist = (assetId: string) => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (!watchlist.includes(assetId)) {
      watchlist.push(assetId);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Added to watchlist");
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = (assetId: string) => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const newWatchlist = watchlist.filter((id: string) => id !== assetId);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
    queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    toast.success("Removed from watchlist");
  };

  // Get top gainers
  const getTopGainers = (limit: number = 10) => {
    return [...assets]
      .filter((asset) => asset.price_change_percentage_24h > 0)
      .sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
      .slice(0, limit);
  };

  // Get top losers
  const getTopLosers = (limit: number = 10) => {
    return [...assets]
      .filter((asset) => asset.price_change_percentage_24h < 0)
      .sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
      .slice(0, limit);
  };

  // Get highest volume
  const getHighestVolume = (limit: number = 10) => {
    return [...assets]
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, limit);
  };

  // Get highest market cap
  const getHighestMarketCap = (limit: number = 10) => {
    return [...assets]
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, limit);
  };

  // Get assets by category (if available)
  const getAssetsByCategory = (category: string) => {
    // This would depend on your data structure
    // For now, return all assets
    return assets;
  };

  // Get price change statistics
  const getPriceChangeStats = () => {
    if (!assets.length) return null;

    const gainers = assets.filter(
      (asset) => asset.price_change_percentage_24h > 0
    );
    const losers = assets.filter(
      (asset) => asset.price_change_percentage_24h < 0
    );
    const unchanged = assets.filter(
      (asset) => asset.price_change_percentage_24h === 0
    );

    return {
      total: assets.length,
      gainers: gainers.length,
      losers: losers.length,
      unchanged: unchanged.length,
      avgGain:
        gainers.length > 0
          ? gainers.reduce(
              (sum, asset) => sum + asset.price_change_percentage_24h,
              0
            ) / gainers.length
          : 0,
      avgLoss:
        losers.length > 0
          ? losers.reduce(
              (sum, asset) => sum + asset.price_change_percentage_24h,
              0
            ) / losers.length
          : 0,
    };
  };

  // Get market sentiment
  const getMarketSentiment = () => {
    if (!assets.length) return "neutral";

    const gainers = assets.filter(
      (asset) => asset.price_change_percentage_24h > 0
    ).length;
    const losers = assets.filter(
      (asset) => asset.price_change_percentage_24h < 0
    ).length;
    const ratio = gainers / (gainers + losers);

    if (ratio > 0.6) return "bullish";
    if (ratio < 0.4) return "bearish";
    return "neutral";
  };

  // Subscribe to real-time updates for specific assets
  const subscribeToAssets = (assetIds: string[]) => {
    // Subscribe to price updates for specific assets
    assetIds.forEach((assetId) => {
      websocketClient.subscribe("price_updates", { asset_id: assetId });
    });
  };

  // Unsubscribe from real-time updates
  const unsubscribeFromAssets = (assetIds: string[]) => {
    assetIds.forEach((assetId) => {
      websocketClient.unsubscribe("price_updates", { asset_id: assetId });
    });
  };

  return {
    // Data
    assets,
    isLoading,
    error,

    // Queries
    useCryptoAsset,
    useAssetMetrics,
    usePriceHistory,
    useLivePrices,
    useMarketTicker,
    useMarketOverview,
    useMarketTrends,
    useSearchAssets,
    useSearchSuggestions,
    useWatchlist,

    // Watchlist management
    addToWatchlist,
    removeFromWatchlist,

    // Real-time
    realTimeData,
    subscribeToAssets,
    unsubscribeFromAssets,

    // Utilities
    refetch,
    getTopGainers,
    getTopLosers,
    getHighestVolume,
    getHighestMarketCap,
    getAssetsByCategory,
    getPriceChangeStats,
    getMarketSentiment,
  };
}
