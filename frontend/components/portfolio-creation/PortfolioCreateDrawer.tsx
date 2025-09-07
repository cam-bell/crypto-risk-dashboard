"use client";

import { useState, useEffect } from "react";
import { X, Plus, TrendingUp, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PortfolioCreateHeader } from "./PortfolioCreateHeader";
import { PortfolioCreateTabs } from "./PortfolioCreateTabs";
import { DiscoverPanel } from "./DiscoverPanel";
import { SearchPanel } from "./SearchPanel";
import { SelectionSummary } from "./SelectionSummary";
import { usePortfolioCreation } from "./hooks/usePortfolioCreation";
import { Portfolio } from "@/types";

interface PortfolioCreateDrawerProps {
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
  existingPortfolios?: Portfolio[];
}

export function PortfolioCreateDrawer({
  isOpen,
  onClose,
  onCreatePortfolio,
  existingPortfolios = [],
}: PortfolioCreateDrawerProps) {
  const [activeTab, setActiveTab] = useState<"discover" | "search" | "import">(
    "discover"
  );

  const {
    portfolioName,
    setPortfolioName,
    portfolioDescription,
    setPortfolioDescription,
    selectedAssets,
    setSelectedAssets,
    addAsset,
    removeAsset,
    updateAssetQuantity,
    updateAssetPrice,
    canCreate,
    handleCreatePortfolio,
    resetForm,
  } = usePortfolioCreation({
    onCreatePortfolio,
    onClose,
    existingPortfolios,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setActiveTab("discover");
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Portfolio
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Build your crypto portfolio in one place
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Portfolio Details */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <PortfolioCreateHeader
            name={portfolioName}
            onNameChange={setPortfolioName}
            description={portfolioDescription}
            onDescriptionChange={setPortfolioDescription}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Asset Selection */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <PortfolioCreateTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "discover" && (
                <DiscoverPanel
                  selectedAssets={selectedAssets}
                  onAssetSelect={addAsset}
                  onAssetDeselect={removeAsset}
                  existingPortfolios={existingPortfolios}
                />
              )}
              {activeTab === "search" && (
                <SearchPanel
                  selectedAssets={selectedAssets}
                  onAssetSelect={addAsset}
                  onAssetDeselect={removeAsset}
                />
              )}
              {activeTab === "import" && (
                <div className="p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Import Portfolio
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    CSV import and wallet connection coming soon
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Selection Summary */}
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <SelectionSummary
              selectedAssets={selectedAssets}
              onUpdateQuantity={updateAssetQuantity}
              onUpdatePrice={updateAssetPrice}
              onRemoveAsset={removeAsset}
              canCreate={canCreate}
              onCreatePortfolio={handleCreatePortfolio}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
