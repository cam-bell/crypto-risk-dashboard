"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AssetCard } from "./AssetCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { CryptoAsset } from "@/types";

interface AssetGridProps {
  assets: CryptoAsset[];
  loading: boolean;
  error: string | null;
  selectedAssets: Array<{
    asset_id: string;
    symbol: string;
    name: string;
    quantity: number;
    average_price: number;
  }>;
  onAssetSelect: (asset: {
    asset_id: string;
    symbol: string;
    name: string;
    quantity: number;
    average_price: number;
  }) => void;
  onAssetDeselect: (assetId: string) => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function AssetGrid({
  assets,
  loading,
  error,
  selectedAssets,
  onAssetSelect,
  onAssetDeselect,
  onRetry,
  emptyMessage,
}: AssetGridProps) {
  const [sortBy, setSortBy] = useState<"market_cap" | "price" | "change_24h">(
    "market_cap"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const selectedAssetIds = useMemo(
    () => new Set(selectedAssets.map((asset) => asset.asset_id)),
    [selectedAssets]
  );

  const sortedAssets = useMemo(() => {
    if (!assets.length) return assets;

    return [...assets].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case "market_cap":
          aValue = a.market_cap || 0;
          bValue = b.market_cap || 0;
          break;
        case "price":
          aValue = a.current_price_usd || 0;
          bValue = b.current_price_usd || 0;
          break;
        case "change_24h":
          aValue = a.price_change_percentage_24h || 0;
          bValue = b.price_change_percentage_24h || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [assets, sortBy, sortOrder]);

  const handleSort = (field: "market_cap" | "price" | "change_24h") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleAssetToggle = (asset: CryptoAsset) => {
    if (selectedAssetIds.has(asset.id)) {
      onAssetDeselect(asset.id);
    } else {
      onAssetSelect({
        asset_id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        quantity: 1,
        average_price: asset.current_price_usd || 0,
      });
    }
  };

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }, [onRetry]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Assets
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {emptyMessage || "No Assets Found"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sort Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sort by:
            </span>
            <div className="flex space-x-1">
              {[
                { key: "market_cap", label: "Market Cap" },
                { key: "price", label: "Price" },
                { key: "change_24h", label: "24h Change" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort(key as any)}
                  className="text-xs"
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {assets.length} assets
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAssetIds.has(asset.id)}
              onToggle={() => handleAssetToggle(asset)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
