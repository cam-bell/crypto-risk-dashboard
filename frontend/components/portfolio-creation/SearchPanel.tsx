"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { AssetGrid } from "./AssetGrid";
import { useAssetSearch } from "./hooks/useAssetSearch";

interface SearchPanelProps {
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
}

export function SearchPanel({
  selectedAssets,
  onAssetSelect,
  onAssetDeselect,
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { searchResults, loading, error, searchAssets, clearResults } =
    useAssetSearch();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchAssets(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, searchAssets, clearResults]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    clearResults();
  };

  const hasResults = searchResults.length > 0;
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search cryptocurrencies by name or symbol..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-hidden">
        {!hasQuery ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Search Cryptocurrencies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a name or symbol to find assets
              </p>
            </div>
          </div>
        ) : (
          <AssetGrid
            assets={searchResults}
            loading={loading}
            error={error}
            selectedAssets={selectedAssets}
            onAssetSelect={onAssetSelect}
            onAssetDeselect={onAssetDeselect}
            onRetry={() => {
              if (debouncedQuery.trim()) {
                searchAssets(debouncedQuery);
              }
            }}
            emptyMessage={
              hasQuery && !loading && !hasResults
                ? `No results found for "${debouncedQuery}"`
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
