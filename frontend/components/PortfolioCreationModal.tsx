"use client";

import { useState, useMemo } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnhancedCryptoSelectionModal } from "./EnhancedCryptoSelectionModal";

interface PortfolioCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePortfolio: (portfolio: {
    name: string;
    description: string;
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>;
  }) => void;
  existingPortfolios?: Array<{
    holdings: Array<{
      asset_id: string;
      symbol: string;
      name: string;
    }>;
  }>;
}

const PREDEFINED_ASSETS = [
  {
    asset_id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    current_price: 45000,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    asset_id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    current_price: 2800,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    asset_id: "ripple",
    symbol: "XRP",
    name: "XRP",
    current_price: 0.55,
    image:
      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  },
  {
    asset_id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    current_price: 0.45,
    image:
      "https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png",
  },
];

export function PortfolioCreationModal({
  isOpen,
  onClose,
  onCreatePortfolio,
  existingPortfolios = [],
}: PortfolioCreationModalProps) {
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<
    Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>
  >([]);
  const [showCryptoSelection, setShowCryptoSelection] = useState(false);

  const handleAssetToggle = (asset: (typeof PREDEFINED_ASSETS)[0]) => {
    const isSelected = selectedAssets.some(
      (a) => a.asset_id === asset.asset_id
    );

    if (isSelected) {
      setSelectedAssets(
        selectedAssets.filter((a) => a.asset_id !== asset.asset_id)
      );
    } else {
      setSelectedAssets([
        ...selectedAssets,
        {
          asset_id: asset.asset_id,
          symbol: asset.symbol,
          name: asset.name,
          quantity: 0,
          average_price: asset.current_price,
        },
      ]);
    }
  };

  const updateAssetQuantity = (assetId: string, quantity: number) => {
    setSelectedAssets(
      selectedAssets.map((asset) =>
        asset.asset_id === assetId ? { ...asset, quantity } : asset
      )
    );
  };

  const updateAssetPrice = (assetId: string, price: number) => {
    setSelectedAssets(
      selectedAssets.map((asset) =>
        asset.asset_id === assetId ? { ...asset, average_price: price } : asset
      )
    );
  };

  const removeAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter((a) => a.asset_id !== assetId));
  };

  const handleCryptoSelection = (
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>
  ) => {
    setSelectedAssets(assets);
    setShowCryptoSelection(false);
  };

  // Extract existing holdings from all portfolios for smart recommendations
  const existingHoldings = useMemo(() => {
    const holdings: Array<{ asset_id: string; symbol: string; name: string }> =
      [];
    existingPortfolios.forEach((portfolio) => {
      portfolio.holdings.forEach((holding) => {
        if (!holdings.find((h) => h.asset_id === holding.asset_id)) {
          holdings.push({
            asset_id: holding.asset_id,
            symbol: holding.symbol,
            name: holding.name,
          });
        }
      });
    });
    return holdings;
  }, [existingPortfolios]);

  const handleCreatePortfolio = () => {
    console.log("🎯 PortfolioCreationModal - handleCreatePortfolio called");
    console.log("📝 Form data:", {
      name: portfolioName,
      description: portfolioDescription,
      selectedAssets: selectedAssets,
    });

    if (!portfolioName.trim()) {
      console.warn("❌ Portfolio name is empty");
      alert("Please enter a portfolio name");
      return;
    }

    if (selectedAssets.length === 0) {
      console.warn("❌ No assets selected");
      alert("Please select at least one asset");
      return;
    }

    // Validate that all selected assets have quantities
    const invalidAssets = selectedAssets.filter((a) => a.quantity <= 0);
    if (invalidAssets.length > 0) {
      alert("Please enter valid quantities for all selected assets");
      return;
    }

    console.log("🚀 Calling parent onCreatePortfolio function...");
    onCreatePortfolio({
      name: portfolioName.trim(),
      description: portfolioDescription.trim(),
      assets: selectedAssets,
    });
    console.log("✅ onCreatePortfolio called successfully");

    // Reset form
    setPortfolioName("");
    setPortfolioDescription("");
    setSelectedAssets([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Portfolio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Portfolio Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio Name *
              </label>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Enter portfolio name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={portfolioDescription}
                onChange={(e) => setPortfolioDescription(e.target.value)}
                placeholder="Enter portfolio description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Asset Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Select Assets
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowCryptoSelection(true)}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Browse All Cryptocurrencies</span>
              </Button>
            </div>

            {selectedAssets.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Assets ({selectedAssets.length})
                </h4>
                <div className="space-y-3">
                  {selectedAssets.map((asset) => (
                    <div
                      key={asset.asset_id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {asset.symbol}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {asset.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAsset(asset.asset_id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={asset.quantity}
                            onChange={(e) =>
                              updateAssetQuantity(
                                asset.asset_id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.000001"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Avg Price ($)
                          </label>
                          <input
                            type="number"
                            value={asset.average_price}
                            onChange={(e) =>
                              updateAssetPrice(
                                asset.asset_id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Total Value: $
                        {(
                          asset.quantity * asset.average_price
                        ).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No assets selected
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Click "Browse All Cryptocurrencies" to select from top,
                  trending, and popular coins
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePortfolio}
            disabled={selectedAssets.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Enhanced Crypto Selection Modal */}
      <EnhancedCryptoSelectionModal
        isOpen={showCryptoSelection}
        onClose={() => setShowCryptoSelection(false)}
        onSelectAssets={handleCryptoSelection}
        existingHoldings={existingHoldings}
      />
    </div>
  );
}
