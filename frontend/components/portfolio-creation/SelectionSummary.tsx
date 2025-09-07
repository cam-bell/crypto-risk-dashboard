"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SelectionSummaryProps {
  selectedAssets: Array<{
    asset_id: string;
    symbol: string;
    name: string;
    quantity: number;
    average_price: number;
  }>;
  onUpdateQuantity: (assetId: string, quantity: number) => void;
  onUpdatePrice: (assetId: string, price: number) => void;
  onRemoveAsset: (assetId: string) => void;
  canCreate: boolean;
  onCreatePortfolio: () => void;
}

export function SelectionSummary({
  selectedAssets,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveAsset,
  canCreate,
  onCreatePortfolio,
}: SelectionSummaryProps) {
  const [editingAsset, setEditingAsset] = useState<string | null>(null);

  const totalValue = selectedAssets.reduce(
    (sum, asset) => sum + asset.quantity * asset.average_price,
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleQuantityChange = (assetId: string, value: string) => {
    const quantity = parseFloat(value) || 0;
    if (quantity >= 0) {
      onUpdateQuantity(assetId, quantity);
    }
  };

  const handlePriceChange = (assetId: string, value: string) => {
    const price = parseFloat(value) || 0;
    if (price >= 0) {
      onUpdatePrice(assetId, price);
    }
  };

  const adjustQuantity = (assetId: string, delta: number) => {
    const asset = selectedAssets.find((a) => a.asset_id === assetId);
    if (asset) {
      const newQuantity = Math.max(0, asset.quantity + delta);
      onUpdateQuantity(assetId, newQuantity);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Portfolio Summary
        </h3>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {selectedAssets.length} asset{selectedAssets.length !== 1 ? "s" : ""}{" "}
          selected
        </div>
      </div>

      {/* Total Value */}
      <div className="p-3 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Portfolio Value
          </div>
        </div>
      </div>

      {/* Selected Assets */}
      <div className="flex-1 overflow-auto">
        {selectedAssets.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No Assets Selected
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Select assets from the left to build your portfolio
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {selectedAssets.map((asset) => (
              <div
                key={asset.asset_id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                {/* Asset Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                      {asset.symbol}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveAsset(asset.asset_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Quantity Input */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(asset.asset_id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={asset.quantity}
                      onChange={(e) =>
                        handleQuantityChange(asset.asset_id, e.target.value)
                      }
                      className="h-8 text-sm text-center"
                      min="0"
                      step="0.000001"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustQuantity(asset.asset_id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Average Price Input */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avg Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      type="number"
                      value={asset.average_price}
                      onChange={(e) =>
                        handlePriceChange(asset.asset_id, e.target.value)
                      }
                      className="h-8 pl-6 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Asset Total */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Value:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(asset.quantity * asset.average_price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onCreatePortfolio}
          disabled={!canCreate}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium py-3"
        >
          Create Portfolio
        </Button>
        {!canCreate && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {selectedAssets.length === 0
              ? "Select at least one asset"
              : "Enter a portfolio name"}
          </p>
        )}
      </div>
    </div>
  );
}
