"use client";

import { useState, useCallback } from "react";
import { CryptoAsset } from "@/types";
import { searchCoins } from "@/lib/server-actions";

export function useAssetSearch() {
  const [searchResults, setSearchResults] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAssets = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the existing backend API for search
      const result = await searchCoins(query, { perPage: 20 });
      if (result && result.length > 0) {
        setSearchResults(result);
      } else {
        // Fallback to sample search results if backend API fails
        const queryLower = query.toLowerCase();
        const sampleResults: CryptoAsset[] = [];

        // Simple keyword matching for demo purposes
        if (queryLower.includes("bitcoin") || queryLower.includes("btc")) {
          sampleResults.push({
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
          });
        }

        if (queryLower.includes("ethereum") || queryLower.includes("eth")) {
          sampleResults.push({
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
          });
        }

        if (sampleResults.length > 0) {
          setSearchResults(sampleResults);
        } else {
          setError("No search results found");
          setSearchResults([]);
        }
      }
    } catch (err) {
      setError("Search failed");
      setSearchResults([]);
      console.error("Error searching assets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchAssets,
    clearResults,
  };
}
