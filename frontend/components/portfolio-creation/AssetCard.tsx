"use client";

import { Check, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CryptoAsset } from "@/types";

interface AssetCardProps {
  asset: CryptoAsset;
  isSelected: boolean;
  onToggle: () => void;
}

export function AssetCard({ asset, isSelected, onToggle }: AssetCardProps) {
  const price = asset.current_price_usd || 0;
  const change24h = asset.price_change_percentage_24h || 0;
  const marketCap = asset.market_cap || 0;
  const volume24h = asset.volume_24h || 0;

  const formatPrice = (value: number) => {
    if (value >= 1) {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected
          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onToggle}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-violet-600 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            {asset.logo_url ? (
              <img
                src={asset.logo_url}
                alt={asset.name}
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {asset.symbol.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {asset.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
              {asset.symbol}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(price)}
          </div>
          <div
            className={`flex items-center space-x-1 text-sm ${getChangeColor(change24h)}`}
          >
            {getChangeIcon(change24h)}
            <span>
              {change24h > 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Market Cap:</span>
            <span className="font-medium">{formatMarketCap(marketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span>24h Volume:</span>
            <span className="font-medium">{formatVolume(volume24h)}</span>
          </div>
          {asset.circulating_supply && (
            <div className="flex justify-between">
              <span>Supply:</span>
              <span className="font-medium">
                {asset.circulating_supply.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        {asset.blockchain && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {asset.blockchain}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
