import { useQuery } from "@tanstack/react-query";
import {
  getCryptoAssets,
  getCryptoAsset,
  getPriceHistory,
  getMarketOverview,
  searchAssets,
} from "@/lib/api";
import { CryptoAsset, PriceHistory } from "@/types";

// Query keys
export const cryptoAssetKeys = {
  all: ["crypto-assets"] as const,
  lists: () => [...cryptoAssetKeys.all, "list"] as const,
  list: (filters: string) => [...cryptoAssetKeys.lists(), { filters }] as const,
  details: () => [...cryptoAssetKeys.all, "detail"] as const,
  detail: (id: string) => [...cryptoAssetKeys.details(), id] as const,
  priceHistory: (id: string, timeframe: string) =>
    [...cryptoAssetKeys.detail(id), "price-history", timeframe] as const,
  marketOverview: ["market-overview"] as const,
  search: (query: string) => [...cryptoAssetKeys.all, "search", query] as const,
};

// Get all crypto assets
export function useCryptoAssets() {
  return useQuery({
    queryKey: cryptoAssetKeys.lists(),
    queryFn: getCryptoAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single crypto asset
export function useCryptoAsset(id: string) {
  return useQuery({
    queryKey: cryptoAssetKeys.detail(id),
    queryFn: () => getCryptoAsset(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get price history for an asset
export function usePriceHistory(assetId: string, timeframe: string) {
  return useQuery({
    queryKey: cryptoAssetKeys.priceHistory(assetId, timeframe),
    queryFn: () => getPriceHistory(assetId, timeframe),
    enabled: !!assetId && !!timeframe,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get market overview
export function useMarketOverview() {
  return useQuery({
    queryKey: cryptoAssetKeys.marketOverview,
    queryFn: getMarketOverview,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Search assets
export function useSearchAssets(query: string) {
  return useQuery({
    queryKey: cryptoAssetKeys.search(query),
    queryFn: () => searchAssets(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get live crypto assets with auto-refresh
export function useLiveCryptoAssets(refreshInterval = 30000) {
  // 30 seconds
  return useQuery({
    queryKey: [...cryptoAssetKeys.lists(), "live"],
    queryFn: getCryptoAssets,
    staleTime: 0, // Always consider stale
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}

// Get live price history with auto-refresh
export function useLivePriceHistory(
  assetId: string,
  timeframe: string,
  refreshInterval = 15000
) {
  // 15 seconds
  return useQuery({
    queryKey: [...cryptoAssetKeys.priceHistory(assetId, timeframe), "live"],
    queryFn: () => getPriceHistory(assetId, timeframe),
    enabled: !!assetId && !!timeframe,
    staleTime: 0, // Always consider stale
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}
