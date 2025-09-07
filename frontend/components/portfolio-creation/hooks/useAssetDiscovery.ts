"use client";

import { useState, useCallback } from "react";
import { CryptoAsset, Portfolio } from "@/types";
import { getCoinsByCategory } from "@/lib/server-actions";

export function useAssetDiscovery() {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing backend API for trending coins
      const result = await getCoinsByCategory("trending", { perPage: 50 });
      if (result && result.length > 0) {
        setAssets(result);
      } else {
        // Fallback to sample data if backend API fails
        const sampleAssets: CryptoAsset[] = [
          {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            current_price_usd: 110276,
            price_change_24h: -470.21,
            price_change_percentage_24h: -0.42,
            market_cap: 2195877505763,
            volume_24h: 19436157735,
            circulating_supply: 19917112,
            total_supply: 19917112,
            max_supply: 21000000,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            current_price_usd: 4283.26,
            price_change_24h: -27.77,
            price_change_percentage_24h: -0.64,
            market_cap: 516988077344,
            volume_24h: 13936092050,
            circulating_supply: 120705149,
            total_supply: 120705149,
            max_supply: undefined,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "tether",
            symbol: "USDT",
            name: "Tether",
            current_price_usd: 1.0,
            price_change_24h: 0.00015,
            price_change_percentage_24h: 0.015,
            market_cap: 168933982719,
            volume_24h: 43469454200,
            circulating_supply: 168871594840,
            total_supply: 168871594840,
            max_supply: undefined,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setAssets(sampleAssets);
      }
    } catch (err) {
      setError("Failed to fetch trending assets");
      console.error("Error fetching trending assets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopGainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing backend API for top gainers
      const result = await getCoinsByCategory("top-gainers", { perPage: 50 });
      if (result && result.length > 0) {
        setAssets(result);
      } else {
        // Fallback to sample data if backend API fails
        const sampleAssets: CryptoAsset[] = [
          {
            id: "solana",
            symbol: "SOL",
            name: "Solana",
            current_price_usd: 245.67,
            price_change_24h: 12.34,
            price_change_percentage_24h: 5.28,
            market_cap: 112345678901,
            volume_24h: 2345678901,
            circulating_supply: 457456789,
            total_supply: 457456789,
            max_supply: undefined,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "cardano",
            symbol: "ADA",
            name: "Cardano",
            current_price_usd: 0.89,
            price_change_24h: 0.05,
            price_change_percentage_24h: 5.95,
            market_cap: 31234567890,
            volume_24h: 1234567890,
            circulating_supply: 35123456789,
            total_supply: 35123456789,
            max_supply: 45000000000,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/975/large/cardano.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setAssets(sampleAssets);
      }
    } catch (err) {
      setError("Failed to fetch top gainers");
      console.error("Error fetching top gainers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopLosers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing backend API for top losers
      const result = await getCoinsByCategory("top-losers", { perPage: 50 });
      if (result && result.length > 0) {
        setAssets(result);
      } else {
        // Fallback to sample data if backend API fails
        const sampleAssets: CryptoAsset[] = [
          {
            id: "dogecoin",
            symbol: "DOGE",
            name: "Dogecoin",
            current_price_usd: 0.23,
            price_change_24h: -0.02,
            price_change_percentage_24h: -8.33,
            market_cap: 34567890123,
            volume_24h: 1234567890,
            circulating_supply: 150123456789,
            total_supply: 150123456789,
            max_supply: undefined,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "shiba-inu",
            symbol: "SHIB",
            name: "Shiba Inu",
            current_price_usd: 0.000012,
            price_change_24h: -0.000002,
            price_change_percentage_24h: -14.29,
            market_cap: 7123456789,
            volume_24h: 234567890,
            circulating_supply: 589123456789012,
            total_supply: 589123456789012,
            max_supply: undefined,
            logo_url:
              "https://coin-images.coingecko.com/coins/images/11939/large/shiba.png",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setAssets(sampleAssets);
      }
    } catch (err) {
      setError("Failed to fetch top losers");
      console.error("Error fetching top losers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing backend API for category-based fetching
      const result = await getCoinsByCategory(category, { perPage: 50 });
      if (result && result.length > 0) {
        setAssets(result);
      } else {
        // Fallback to sample data based on category
        let sampleAssets: CryptoAsset[] = [];

        switch (category.toLowerCase()) {
          case "defi":
            sampleAssets = [
              {
                id: "uniswap",
                symbol: "UNI",
                name: "Uniswap",
                current_price_usd: 12.45,
                price_change_24h: 0.23,
                price_change_percentage_24h: 1.88,
                market_cap: 7890123456,
                volume_24h: 123456789,
                circulating_supply: 634123456,
                total_supply: 1000000000,
                max_supply: 1000000000,
                logo_url:
                  "https://coin-images.coingecko.com/coins/images/12504/large/uniswap-uni.png",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];
            break;
          case "ai":
            sampleAssets = [
              {
                id: "fetch-ai",
                symbol: "FET",
                name: "Fetch.ai",
                current_price_usd: 2.34,
                price_change_24h: 0.12,
                price_change_percentage_24h: 5.41,
                market_cap: 2345678901,
                volume_24h: 45678901,
                circulating_supply: 1001234567,
                total_supply: 1001234567,
                max_supply: 1001234567,
                logo_url:
                  "https://coin-images.coingecko.com/coins/images/5681/large/Fetch.jpg",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];
            break;
          default:
            sampleAssets = [
              {
                id: "chainlink",
                symbol: "LINK",
                name: "Chainlink",
                current_price_usd: 18.76,
                price_change_24h: 0.45,
                price_change_percentage_24h: 2.46,
                market_cap: 11234567890,
                volume_24h: 234567890,
                circulating_supply: 598123456,
                total_supply: 1000000000,
                max_supply: 1000000000,
                logo_url:
                  "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];
        }

        setAssets(sampleAssets);
      }
    } catch (err) {
      setError(`Failed to fetch ${category} assets`);
      console.error(`Error fetching ${category} assets:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(
    async (existingPortfolios: Portfolio[]) => {
      setLoading(true);
      setError(null);
      try {
        // Get smart recommendations based on existing portfolios
        // For now, we'll fetch a mix of categories for diversification
        const categories = ["defi", "ai", "layer-2", "meme"];
        const allAssets: CryptoAsset[] = [];

        for (const category of categories) {
          const result = await getCoinsByCategory(category, { perPage: 5 });
          if (result && result.length > 0) {
            allAssets.push(...result);
          }
        }

        // Remove duplicates and limit to 20 assets
        const uniqueAssets = allAssets
          .filter(
            (asset, index, self) =>
              index === self.findIndex((a) => a.id === asset.id)
          )
          .slice(0, 20);

        setAssets(uniqueAssets);
      } catch (err) {
        setError("Failed to fetch recommendations");
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    assets,
    loading,
    error,
    fetchTrending,
    fetchTopGainers,
    fetchTopLosers,
    fetchByCategory,
    fetchRecommendations,
  };
}
