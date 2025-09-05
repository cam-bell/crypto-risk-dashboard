"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  Star,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCoinsByCategory, searchCoins } from "@/lib/server-actions";
import { CryptoAsset } from "@/types";

interface EnhancedCryptoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssets: (
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>
  ) => void;
  existingHoldings?: Array<{
    asset_id: string;
    symbol: string;
    name: string;
  }>;
}

interface CryptoCategory {
  id: string;
  name: string;
  description: string;
}

const CRYPTO_CATEGORIES: CryptoCategory[] = [
  { id: "all", name: "All", description: "All cryptocurrencies" },
  {
    id: "top",
    name: "Top by Market Cap",
    description: "Largest cryptocurrencies",
  },
  {
    id: "trending",
    name: "Trending",
    description: "High volume & price movement",
  },
  {
    id: "recommended",
    name: "Recommended",
    description: "Based on your existing holdings",
  },
  { id: "defi", name: "DeFi", description: "Decentralized Finance" },
  { id: "layer1", name: "Layer 1", description: "Base blockchain protocols" },
  { id: "layer2", name: "Layer 2", description: "Scaling solutions" },
  { id: "meme", name: "Meme Coins", description: "Community-driven tokens" },
  { id: "gaming", name: "Gaming", description: "Gaming & NFT tokens" },
  {
    id: "stablecoin",
    name: "Stablecoins",
    description: "Price-stable cryptocurrencies",
  },
];

const MARKET_CAP_FILTERS = [
  { id: "all", name: "All", min: 0, max: Infinity },
  { id: "large", name: "Large Cap (>$10B)", min: 10000000000, max: Infinity },
  { id: "mid", name: "Mid Cap ($1B-$10B)", min: 1000000000, max: 10000000000 },
  { id: "small", name: "Small Cap (<$1B)", min: 0, max: 1000000000 },
];

export function EnhancedCryptoSelectionModal({
  isOpen,
  onClose,
  onSelectAssets,
  existingHoldings = [],
}: EnhancedCryptoSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("top");
  const [selectedMarketCap, setSelectedMarketCap] = useState("all");
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<
    Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>
  >([]);

  // Smart recommendations function
  const getSmartRecommendations = (
    assets: CryptoAsset[],
    holdings: Array<{ asset_id: string; symbol: string; name: string }>
  ) => {
    if (holdings.length === 0) {
      // If no existing holdings, recommend top diversified assets
      return assets
        .filter((asset) => asset.market_cap > 1000000000) // Only large cap
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 20);
    }

    const existingSymbols = new Set(
      holdings.map((h) => h.symbol.toLowerCase())
    );
    const recommendations: CryptoAsset[] = [];

    // 1. Diversification recommendations - different categories
    const diversificationMap = {
      BTC: ["ETH", "ADA", "SOL", "DOT"], // Layer 1 alternatives
      ETH: ["BTC", "ADA", "SOL", "AVAX"], // Layer 1 alternatives
      ADA: ["BTC", "ETH", "SOL", "DOT"], // Layer 1 alternatives
      SOL: ["BTC", "ETH", "ADA", "AVAX"], // Layer 1 alternatives
    };

    // 2. DeFi recommendations if holding major tokens
    const defiRecommendations = ["UNI", "AAVE", "COMP", "CRV", "SUSHI", "YFI"];

    // 3. Stablecoin recommendations for risk management
    const stablecoinRecommendations = ["USDT", "USDC", "DAI", "BUSD"];

    // 4. Layer 2 recommendations if holding ETH
    const layer2Recommendations = ["MATIC", "OP", "ARB", "IMX"];

    // Build recommendations based on existing holdings
    holdings.forEach((holding) => {
      const symbol = holding.symbol.toUpperCase();

      // Add diversification recommendations
      if (diversificationMap[symbol as keyof typeof diversificationMap]) {
        diversificationMap[symbol as keyof typeof diversificationMap].forEach(
          (recSymbol) => {
            const recAsset = assets.find(
              (asset) =>
                asset.symbol.toUpperCase() === recSymbol &&
                !existingSymbols.has(asset.symbol.toLowerCase())
            );
            if (
              recAsset &&
              !recommendations.find((r) => r.id === recAsset.id)
            ) {
              recommendations.push(recAsset);
            }
          }
        );
      }

      // Add DeFi recommendations for major tokens
      if (["BTC", "ETH", "ADA", "SOL"].includes(symbol)) {
        defiRecommendations.forEach((defiSymbol) => {
          const defiAsset = assets.find(
            (asset) =>
              asset.symbol.toUpperCase() === defiSymbol &&
              !existingSymbols.has(asset.symbol.toLowerCase())
          );
          if (
            defiAsset &&
            !recommendations.find((r) => r.id === defiAsset.id)
          ) {
            recommendations.push(defiAsset);
          }
        });
      }

      // Add Layer 2 recommendations for ETH holders
      if (symbol === "ETH") {
        layer2Recommendations.forEach((l2Symbol) => {
          const l2Asset = assets.find(
            (asset) =>
              asset.symbol.toUpperCase() === l2Symbol &&
              !existingSymbols.has(asset.symbol.toLowerCase())
          );
          if (l2Asset && !recommendations.find((r) => r.id === l2Asset.id)) {
            recommendations.push(l2Asset);
          }
        });
      }
    });

    // Add stablecoin recommendations for risk management
    stablecoinRecommendations.forEach((stableSymbol) => {
      const stableAsset = assets.find(
        (asset) =>
          asset.symbol.toUpperCase() === stableSymbol &&
          !existingSymbols.has(asset.symbol.toLowerCase())
      );
      if (
        stableAsset &&
        !recommendations.find((r) => r.id === stableAsset.id)
      ) {
        recommendations.push(stableAsset);
      }
    });

    // If we don't have enough recommendations, add top assets by market cap
    if (recommendations.length < 10) {
      const topAssets = assets
        .filter(
          (asset) =>
            asset.market_cap > 1000000000 &&
            !existingSymbols.has(asset.symbol.toLowerCase()) &&
            !recommendations.find((r) => r.id === asset.id)
        )
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 10 - recommendations.length);

      recommendations.push(...topAssets);
    }

    return recommendations.slice(0, 20); // Limit to 20 recommendations
  };

  // Fetch crypto assets based on category using server actions
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setError(null);
      setCryptoAssets([]);
      return;
    }

    const fetchCryptoAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        let assets: CryptoAsset[] = [];

        // Use server actions for data fetching
        if (searchQuery.trim()) {
          // Search mode
          assets = (await searchCoins(searchQuery, {
            perPage: 100,
          })) as CryptoAsset[];
        } else {
          // Category mode
          assets = (await getCoinsByCategory(selectedCategory as any, {
            perPage: 100,
          })) as CryptoAsset[];
        }

        // Update with real data if API call succeeds
        setCryptoAssets(assets);
        setError(null);
      } catch (err) {
        console.error("Error fetching crypto assets:", err);
        setError("API connection unavailable - using demo data");
        // Fallback to predefined assets only when API fails
        setCryptoAssets(getFallbackAssets());
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoAssets();
  }, [isOpen, selectedCategory, searchQuery]);

  // Fallback assets when API fails
  const getFallbackAssets = (): CryptoAsset[] => [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      current_price: 45000,
      price_change_24h: -500,
      price_change_percentage_24h: -1.1,
      market_cap: 850000000000,
      volume_24h: 25000000000,
      circulating_supply: 19500000,
      total_supply: 21000000,
      max_supply: 21000000,
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      current_price: 2800,
      price_change_24h: 50,
      price_change_percentage_24h: 1.8,
      market_cap: 340000000000,
      volume_24h: 15000000000,
      circulating_supply: 120000000,
      total_supply: 0,
      max_supply: 0,
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "ripple",
      symbol: "XRP",
      name: "XRP",
      current_price: 0.55,
      price_change_24h: 0.02,
      price_change_percentage_24h: 3.8,
      market_cap: 30000000000,
      volume_24h: 2000000000,
      circulating_supply: 55000000000,
      total_supply: 100000000000,
      max_supply: 100000000000,
      image:
        "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      current_price: 0.45,
      price_change_24h: -0.02,
      price_change_percentage_24h: -4.3,
      market_cap: 15000000000,
      volume_24h: 800000000,
      circulating_supply: 35000000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      image:
        "https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      current_price: 95,
      price_change_24h: 3,
      price_change_percentage_24h: 3.3,
      market_cap: 40000000000,
      volume_24h: 3000000000,
      circulating_supply: 420000000,
      total_supply: 500000000,
      max_supply: null,
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "polygon",
      symbol: "MATIC",
      name: "Polygon",
      current_price: 0.85,
      price_change_24h: -0.05,
      price_change_percentage_24h: -5.6,
      market_cap: 8000000000,
      volume_24h: 500000000,
      circulating_supply: 9500000000,
      total_supply: 10000000000,
      max_supply: 10000000000,
      image:
        "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "dogecoin",
      symbol: "DOGE",
      name: "Dogecoin",
      current_price: 0.08,
      price_change_24h: 0.002,
      price_change_percentage_24h: 2.5,
      market_cap: 12000000000,
      volume_24h: 800000000,
      circulating_supply: 150000000000,
      total_supply: 0,
      max_supply: 0,
      image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "avalanche",
      symbol: "AVAX",
      name: "Avalanche",
      current_price: 25,
      price_change_24h: -0.5,
      price_change_percentage_24h: -2.0,
      market_cap: 6000000000,
      volume_24h: 400000000,
      circulating_supply: 240000000,
      total_supply: 720000000,
      max_supply: 720000000,
      image:
        "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "chainlink",
      symbol: "LINK",
      name: "Chainlink",
      current_price: 12,
      price_change_24h: 0.3,
      price_change_percentage_24h: 2.6,
      market_cap: 7000000000,
      volume_24h: 600000000,
      circulating_supply: 583000000,
      total_supply: 1000000000,
      max_supply: 1000000000,
      image:
        "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "uniswap",
      symbol: "UNI",
      name: "Uniswap",
      current_price: 6.5,
      price_change_24h: -0.2,
      price_change_percentage_24h: -3.0,
      market_cap: 4000000000,
      volume_24h: 300000000,
      circulating_supply: 615000000,
      total_supply: 1000000000,
      max_supply: 1000000000,
      image:
        "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "litecoin",
      symbol: "LTC",
      name: "Litecoin",
      current_price: 70,
      price_change_24h: 1.5,
      price_change_percentage_24h: 2.2,
      market_cap: 5000000000,
      volume_24h: 500000000,
      circulating_supply: 74000000,
      total_supply: 84000000,
      max_supply: 84000000,
      image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
      last_updated: new Date().toISOString(),
    },
    {
      id: "polkadot",
      symbol: "DOT",
      name: "Polkadot",
      current_price: 5.2,
      price_change_24h: -0.1,
      price_change_percentage_24h: -1.9,
      market_cap: 6000000000,
      volume_24h: 200000000,
      circulating_supply: 1150000000,
      total_supply: 0,
      max_supply: 0,
      image:
        "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      last_updated: new Date().toISOString(),
    },
  ];

  // Filter and search logic
  const filteredAssets = useMemo(() => {
    let filtered = cryptoAssets;

    // Apply market cap filter
    if (selectedMarketCap !== "all") {
      const filter = MARKET_CAP_FILTERS.find((f) => f.id === selectedMarketCap);
      if (filter) {
        filtered = filtered.filter(
          (asset) =>
            asset.market_cap >= filter.min && asset.market_cap <= filter.max
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.symbol.toLowerCase().includes(query)
      );
    }

    // Apply category-specific filtering
    if (selectedCategory === "recommended") {
      // Smart recommendations based on existing holdings
      filtered = getSmartRecommendations(filtered, existingHoldings);
    } else if (selectedCategory === "defi") {
      // This would ideally come from API, but for now we'll use a simple filter
      const defiKeywords = [
        "uni",
        "aave",
        "compound",
        "maker",
        "curve",
        "sushi",
        "yearn",
      ];
      filtered = filtered.filter((asset) =>
        defiKeywords.some(
          (keyword) =>
            asset.name.toLowerCase().includes(keyword) ||
            asset.symbol.toLowerCase().includes(keyword)
        )
      );
    } else if (selectedCategory === "layer1") {
      const layer1Keywords = [
        "bitcoin",
        "ethereum",
        "cardano",
        "solana",
        "avalanche",
        "polkadot",
      ];
      filtered = filtered.filter((asset) =>
        layer1Keywords.some(
          (keyword) =>
            asset.name.toLowerCase().includes(keyword) ||
            asset.symbol.toLowerCase().includes(keyword)
        )
      );
    } else if (selectedCategory === "meme") {
      const memeKeywords = ["dogecoin", "shiba", "pepe", "floki", "bonk"];
      filtered = filtered.filter((asset) =>
        memeKeywords.some(
          (keyword) =>
            asset.name.toLowerCase().includes(keyword) ||
            asset.symbol.toLowerCase().includes(keyword)
        )
      );
    }

    return filtered;
  }, [
    cryptoAssets,
    searchQuery,
    selectedCategory,
    selectedMarketCap,
    existingHoldings,
  ]);

  const handleAssetToggle = (asset: CryptoAsset) => {
    const isSelected = selectedAssets.some((a) => a.asset_id === asset.id);

    if (isSelected) {
      setSelectedAssets(selectedAssets.filter((a) => a.asset_id !== asset.id));
    } else {
      setSelectedAssets([
        ...selectedAssets,
        {
          asset_id: asset.id,
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

  const handleConfirmSelection = () => {
    // Validate that all selected assets have quantities
    const invalidAssets = selectedAssets.filter((a) => a.quantity <= 0);
    if (invalidAssets.length > 0) {
      alert("Please enter valid quantities for all selected assets");
      return;
    }

    onSelectAssets(selectedAssets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Cryptocurrencies
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose from top, trending, and popular cryptocurrencies
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cryptocurrencies by name or symbol..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Category and Market Cap Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {CRYPTO_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Cap Filter */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <select
                value={selectedMarketCap}
                onChange={(e) => setSelectedMarketCap(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {MARKET_CAP_FILTERS.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading cryptocurrencies...
              </span>
            </div>
          ) : error && error.length > 0 ? (
            <div className="space-y-4">
              {/* Show a subtle notification at the top */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">
                      ℹ️
                    </span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {error} Showing demo data with popular cryptocurrencies.
                  </p>
                </div>
              </div>

              {/* Show the crypto assets grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAssets.some(
                    (a) => a.asset_id === asset.id
                  );
                  const selectedAsset = selectedAssets.find(
                    (a) => a.asset_id === asset.id
                  );

                  return (
                    <div
                      key={asset.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleAssetToggle(asset)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/40x40?text=?";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {asset.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            ${asset.current_price.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm ${
                              asset.price_change_percentage_24h >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {asset.price_change_percentage_24h >= 0 ? "+" : ""}
                            {asset.price_change_percentage_24h.toFixed(2)}%
                          </p>
                        </div>
                        <div className="ml-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleAssetToggle(asset)}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={selectedAsset?.quantity || 0}
                                onChange={(e) =>
                                  updateAssetQuantity(
                                    asset.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                step="0.000001"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Avg Price ($)
                              </label>
                              <input
                                type="number"
                                value={
                                  selectedAsset?.average_price ||
                                  asset.current_price
                                }
                                onChange={(e) =>
                                  updateAssetPrice(
                                    asset.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Total Value: $
                              {(
                                (selectedAsset?.quantity || 0) *
                                (selectedAsset?.average_price || 0)
                              ).toLocaleString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAsset(asset.id);
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssets.some(
                  (a) => a.asset_id === asset.id
                );
                const selectedAsset = selectedAssets.find(
                  (a) => a.asset_id === asset.id
                );

                return (
                  <div
                    key={asset.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleAssetToggle(asset)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/40x40?text=?";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {asset.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {asset.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${asset.current_price.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm ${
                            asset.price_change_percentage_24h >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {asset.price_change_percentage_24h >= 0 ? "+" : ""}
                          {asset.price_change_percentage_24h.toFixed(2)}%
                        </p>
                      </div>
                      <div className="ml-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleAssetToggle(asset)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={selectedAsset?.quantity || 0}
                              onChange={(e) =>
                                updateAssetQuantity(
                                  asset.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              step="0.000001"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Avg Price ($)
                            </label>
                            <input
                              type="number"
                              value={
                                selectedAsset?.average_price ||
                                asset.current_price
                              }
                              onChange={(e) =>
                                updateAssetPrice(
                                  asset.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Value: $
                            {(
                              (selectedAsset?.quantity || 0) *
                              (selectedAsset?.average_price || 0)
                            ).toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAsset(asset.id);
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredAssets.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No cryptocurrencies found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedAssets.length} asset
            {selectedAssets.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedAssets.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Selected Assets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
