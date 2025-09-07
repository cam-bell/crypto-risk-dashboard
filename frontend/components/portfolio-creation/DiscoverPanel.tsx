"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ArrowUp, ArrowDown, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AssetGrid } from "./AssetGrid";
import { useAssetDiscovery } from "./hooks/useAssetDiscovery";
import { Portfolio } from "@/types";

interface DiscoverPanelProps {
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
  existingPortfolios: Portfolio[];
}

const DISCOVER_FILTERS = [
  {
    id: "trending",
    label: "Trending",
    icon: TrendingUp,
    description: "High volume & movement",
  },
  {
    id: "gainers",
    label: "Top Gainers",
    icon: ArrowUp,
    description: "24h price leaders",
  },
  {
    id: "losers",
    label: "Top Losers",
    icon: ArrowDown,
    description: "24h price decliners",
  },
  {
    id: "recent",
    label: "Recently Added",
    icon: Clock,
    description: "New to market",
  },
];

const CATEGORY_CHIPS = [
  { id: "all", label: "All", color: "gray" },
  { id: "ai", label: "AI", color: "blue" },
  { id: "defi", label: "DeFi", color: "green" },
  { id: "layer-2", label: "L2", color: "purple" },
  { id: "meme", label: "Memes", color: "pink" },
  { id: "stablecoin", label: "Stablecoins", color: "yellow" },
  { id: "rwa", label: "RWA", color: "indigo" },
];

export function DiscoverPanel({
  selectedAssets,
  onAssetSelect,
  onAssetDeselect,
  existingPortfolios,
}: DiscoverPanelProps) {
  const [activeFilter, setActiveFilter] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    assets,
    loading,
    error,
    fetchTrending,
    fetchTopGainers,
    fetchTopLosers,
    fetchByCategory,
    fetchRecommendations,
  } = useAssetDiscovery();

  // Load initial data
  useEffect(() => {
    if (activeFilter === "trending") {
      fetchTrending();
    } else if (activeFilter === "gainers") {
      fetchTopGainers();
    } else if (activeFilter === "losers") {
      fetchTopLosers();
    } else if (activeFilter === "recent") {
      fetchRecommendations(existingPortfolios);
    }
  }, [
    activeFilter,
    existingPortfolios,
    fetchTrending,
    fetchTopGainers,
    fetchTopLosers,
    fetchRecommendations,
  ]);

  // Load category data when category changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      fetchByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchByCategory]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedCategory("all"); // Reset category when changing filters
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveFilter("all"); // Reset filter when changing categories
  };

  const getFilterIcon = (filterId: string) => {
    const filter = DISCOVER_FILTERS.find((f) => f.id === filterId);
    return filter?.icon || TrendingUp;
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      indigo:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter Chips */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* Discovery Filters */}
          <div>
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discovery
            </h3>
            <div className="flex flex-wrap gap-1">
              {DISCOVER_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;

                return (
                  <Button
                    key={filter.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(filter.id)}
                    className={`flex items-center space-x-1 text-xs ${
                      isActive
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{filter.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categories
            </h3>
            <div className="flex flex-wrap gap-1">
              {CATEGORY_CHIPS.map((category) => {
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : getCategoryColor(category.color)
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-hidden">
        <AssetGrid
          assets={assets}
          loading={loading}
          error={error}
          selectedAssets={selectedAssets}
          onAssetSelect={onAssetSelect}
          onAssetDeselect={onAssetDeselect}
          onRetry={() => {
            if (activeFilter === "trending") {
              fetchTrending();
            } else if (activeFilter === "gainers") {
              fetchTopGainers();
            } else if (activeFilter === "losers") {
              fetchTopLosers();
            } else if (activeFilter === "recent") {
              fetchRecommendations(existingPortfolios);
            } else if (selectedCategory !== "all") {
              fetchByCategory(selectedCategory);
            }
          }}
          emptyMessage="No assets found for this filter"
        />
      </div>
    </div>
  );
}
