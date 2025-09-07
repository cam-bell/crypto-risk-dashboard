import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Portfolio } from "@/types";
import { useRealTimeData } from "./useRealTimeData";
import { toast } from "react-hot-toast";

export function usePortfolios() {
  const queryClient = useQueryClient();

  // Real-time data subscription
  const realTimeData = useRealTimeData({
    enablePortfolioUpdates: true,
    enableAlerts: true,
    showNotifications: true,
  });

  // Get all portfolios - longer cache time since this doesn't change frequently
  const {
    data: portfolios = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      console.log("🔍 [usePortfolios] Fetching portfolios from API...");
      try {
        // Use the same user_id that we use for creating portfolios
        const userId = "6abf5032-143e-41b4-a664-bda6e193000d";
        console.log("👤 [usePortfolios] Fetching portfolios for user:", userId);
        const result = await apiClient.getPortfolios(userId);
        console.log("📊 [usePortfolios] Received portfolios:", result);
        console.log("📊 [usePortfolios] Portfolio count:", result.length);
        console.log(
          "📊 [usePortfolios] Portfolio names:",
          result.map((p) => p.name)
        );
        return result;
      } catch (error) {
        console.error("❌ [usePortfolios] Error fetching portfolios:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for portfolio list
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false, // No automatic refetch
  });

  // Get single portfolio
  const usePortfolio = (id: string) => {
    return useQuery({
      queryKey: ["portfolio", id],
      queryFn: () => apiClient.getPortfolio(id),
      staleTime: 2 * 60 * 1000, // 2 minutes for portfolio details
      enabled: !!id,
    });
  };

  // Get portfolio with live data - shorter cache time for real-time data
  const usePortfolioLiveData = (id: string) => {
    return useQuery({
      queryKey: ["portfolio-live-data", id],
      queryFn: () => apiClient.getPortfolioLiveData(id),
      staleTime: 30 * 1000, // 30 seconds for live data
      enabled: !!id,
      refetchInterval: 60 * 1000, // Refetch every minute for live data
    });
  };

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: (data: Partial<Portfolio>) => apiClient.createPortfolio(data),
    onSuccess: (newPortfolio) => {
      // Update the cache with the real portfolio data
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        // Remove any temporary portfolio and add the real one
        const filteredOld = old.filter((p) => !p.id.startsWith("temp-"));
        return [...filteredOld, newPortfolio];
      });

      // Also invalidate to ensure we have the latest data with holdings
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
    onError: (err, newPortfolio) => {
      // Remove any temporary portfolio on error
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) =>
        old.filter((p) => !p.id.startsWith("temp-"))
      );
      toast.error("Failed to create portfolio");
    },
  });

  // Create portfolio with holdings mutation
  const createPortfolioWithHoldingsMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      assets: Array<{
        asset_id: string;
        symbol: string;
        name: string;
        quantity: number;
        average_price: number;
      }>;
    }) => {
      console.log(
        "🚀 [usePortfolios] Starting portfolio creation with data:",
        data
      );

      try {
        // Create portfolio first
        console.log("📡 [usePortfolios] Creating portfolio...");
        const portfolio = await apiClient.createPortfolio({
          name: data.name,
          description: data.description,
        });
        console.log(
          "✅ [usePortfolios] Portfolio created successfully:",
          portfolio
        );

        // Create holdings for each asset using dynamic asset IDs
        console.log(
          "🔄 [usePortfolios] Creating holdings for",
          data.assets.length,
          "assets"
        );

        const holdingsResults = [];
        for (const asset of data.assets) {
          // Use the asset_id directly as it's the CoinGecko ID
          const cryptoAssetId = asset.asset_id;
          if (cryptoAssetId) {
            console.log(
              `📦 [usePortfolios] Adding holding for ${asset.name} (${asset.symbol})`
            );
            try {
              const holding = await apiClient.addPortfolioHolding(
                portfolio.id,
                {
                  crypto_asset_id: cryptoAssetId,
                  quantity: asset.quantity,
                  average_buy_price_usd: asset.average_price,
                  notes: `Added via portfolio creation`,
                }
              );
              console.log(
                `✅ [usePortfolios] Holding created for ${asset.name}:`,
                holding
              );
              holdingsResults.push({
                success: true,
                asset: asset.name,
                holding,
              });
            } catch (holdingError: any) {
              console.error(
                `❌ [usePortfolios] Error creating holding for ${asset.name}:`,
                holdingError
              );
              holdingsResults.push({
                success: false,
                asset: asset.name,
                error: holdingError,
              });
              // Don't throw immediately, collect all errors
            }
          } else {
            console.warn(
              `⚠️ [usePortfolios] No asset ID mapping found for ${asset.asset_id}`
            );
            holdingsResults.push({
              success: false,
              asset: asset.name,
              error: "No asset ID mapping",
            });
          }
        }

        // Check if any holdings failed
        const failedHoldings = holdingsResults.filter((r) => !r.success);
        if (failedHoldings.length > 0) {
          console.error(
            "❌ [usePortfolios] Some holdings failed to create:",
            failedHoldings
          );
          console.warn(
            "⚠️ [usePortfolios] Portfolio was created but some holdings failed. Continuing..."
          );
          // Don't throw error - portfolio was created successfully, just some holdings failed
        }

        console.log(
          "🎉 [usePortfolios] Portfolio creation completed successfully"
        );
        return portfolio;
      } catch (error) {
        console.error("❌ [usePortfolios] Portfolio creation failed:", error);
        throw error;
      }
    },
    onMutate: async (newPortfolioData) => {
      console.log(
        "🔄 [usePortfolios] onMutate: Starting optimistic update for:",
        newPortfolioData.name
      );

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      // Snapshot previous value
      const previousPortfolios = queryClient.getQueryData(["portfolios"]) as
        | Portfolio[]
        | undefined;
      console.log(
        "📸 [usePortfolios] onMutate: Previous portfolios count:",
        previousPortfolios?.length || 0
      );

      // Create optimistic portfolio with calculated values
      const totalValue = newPortfolioData.assets.reduce(
        (sum, asset) => sum + asset.quantity * asset.average_price,
        0
      );

      const assetIdMapping: Record<string, string> = {
        bitcoin: "6abf5032-143e-41b4-a664-bda6e193000d",
        ethereum: "3d79dad5-e930-4a17-a035-878031e68a6a",
        cardano: "158c9204-1b0e-4b78-8a39-80ba975a5759",
        chainlink: "6abf5032-143e-41b4-a664-bda6e193000d", // Use Bitcoin ID as fallback
        "wrapped-bitcoin": "6abf5032-143e-41b4-a664-bda6e193000d", // Use Bitcoin ID as fallback
      };

      const optimisticPortfolio: Portfolio = {
        id: `temp-${Date.now()}`,
        name: newPortfolioData.name,
        description: newPortfolioData.description,
        user_id: "6abf5032-143e-41b4-a664-bda6e193000d",
        is_default: false,
        is_public: false,
        total_value_usd: totalValue,
        total_invested_usd: totalValue,
        total_profit_loss_usd: 0,
        total_profit_loss_percentage: 0,
        risk_score: 5, // Default medium risk
        volatility: undefined,
        sharpe_ratio: undefined,
        max_drawdown: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        holdings: newPortfolioData.assets.map((asset) => ({
          id: `temp-holding-${Date.now()}-${asset.asset_id}`,
          crypto_asset_id: asset.asset_id, // Use CoinGecko ID directly
          quantity: asset.quantity,
          average_buy_price_usd: asset.average_price,
          total_invested_usd: asset.quantity * asset.average_price,
          current_value_usd: asset.quantity * asset.average_price,
          profit_loss_usd: 0,
          profit_loss_percentage: 0,
          notes: `Added via portfolio creation`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          crypto_asset: {
            id: asset.asset_id, // Use CoinGecko ID directly
            symbol: asset.symbol,
            name: asset.name,
            current_price_usd: asset.average_price,
            market_cap: 0,
            volume_24h: 0,
            price_change_24h: 0,
            price_change_percentage_24h: 0,
            total_supply: 0,
            circulating_supply: 0,
            max_supply: undefined,
            is_active: true,
            logo_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        })),
      };

      console.log(
        "🎯 [usePortfolios] onMutate: Created optimistic portfolio:",
        optimisticPortfolio
      );

      // Optimistically update
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        const newPortfolios = [...old, optimisticPortfolio];
        console.log(
          "📝 [usePortfolios] onMutate: Updated portfolios count:",
          newPortfolios.length
        );
        return newPortfolios;
      });

      return { previousPortfolios };
    },
    onSuccess: (newPortfolio) => {
      console.log(
        "✅ [usePortfolios] onSuccess: Portfolio created successfully:",
        newPortfolio
      );

      // Update the cache with the real portfolio data
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        // Remove any temporary portfolio and add the real one
        const filteredOld = old.filter((p) => !p.id.startsWith("temp-"));
        const updatedPortfolios = [...filteredOld, newPortfolio];
        console.log(
          "🔄 [usePortfolios] onSuccess: Updated portfolios count:",
          updatedPortfolios.length
        );
        console.log(
          "📋 [usePortfolios] onSuccess: Portfolio names:",
          updatedPortfolios.map((p) => p.name)
        );
        return updatedPortfolios;
      });

      // Wait a moment for database operations to complete, then invalidate
      setTimeout(() => {
        console.log(
          "🔄 [usePortfolios] onSuccess: Invalidating queries to refetch latest data"
        );
        queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      }, 2000); // Wait 2 seconds for database operations to complete
    },
    onError: (err, newPortfolioData, context) => {
      console.error(
        "❌ [usePortfolios] onError: Portfolio creation failed:",
        err
      );
      console.error("❌ [usePortfolios] onError: Error details:", {
        message: err.message,
        stack: err.stack,
        portfolioData: newPortfolioData,
      });

      // Rollback on error
      if (context?.previousPortfolios) {
        console.log(
          "🔄 [usePortfolios] onError: Rolling back to previous portfolios"
        );
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error(`Failed to create portfolio: ${err.message}`);
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      apiClient.updatePortfolio(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] });
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      const previousPortfolio = queryClient.getQueryData(["portfolio", id]);
      const previousPortfolios = queryClient.getQueryData(["portfolios"]);

      // Optimistically update portfolio
      queryClient.setQueryData(
        ["portfolio", id],
        (old: Portfolio | undefined) => {
          if (!old) return old;
          return { ...old, ...data, updated_at: new Date().toISOString() };
        }
      );

      // Optimistically update portfolios list
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        return old.map((portfolio) =>
          portfolio.id === id
            ? { ...portfolio, ...data, updated_at: new Date().toISOString() }
            : portfolio
        );
      });

      return { previousPortfolio, previousPortfolios };
    },
    onError: (err, { id }, context) => {
      if (context?.previousPortfolio) {
        queryClient.setQueryData(["portfolio", id], context.previousPortfolio);
      }
      if (context?.previousPortfolios) {
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error("Failed to update portfolio");
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePortfolio(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      const previousPortfolios = queryClient.getQueryData(["portfolios"]);

      // Optimistically remove portfolio
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        return old.filter((portfolio) => portfolio.id !== id);
      });

      // Remove portfolio from cache
      queryClient.removeQueries({ queryKey: ["portfolio", id] });

      return { previousPortfolios };
    },
    onError: (err, id, context) => {
      if (context?.previousPortfolios) {
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error("Failed to delete portfolio");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Subscribe to real-time updates for specific portfolio
  const subscribeToPortfolio = (portfolioId: string) => {
    realTimeData.subscribe(portfolioId);
  };

  // Unsubscribe from real-time updates
  const unsubscribeFromPortfolio = (portfolioId: string) => {
    realTimeData.unsubscribe(portfolioId);
  };

  // Get portfolio summary statistics
  const getPortfolioStats = () => {
    if (!portfolios.length) return null;

    const totalValue = portfolios.reduce(
      (sum, p) => sum + (p.total_value_usd || 0),
      0
    );
    const totalCost = portfolios.reduce(
      (sum, p) => sum + (p.total_invested_usd || 0),
      0
    );
    const totalPnl = portfolios.reduce(
      (sum, p) => sum + (p.total_profit_loss_usd || 0),
      0
    );
    const avgRiskScore =
      portfolios.reduce((sum, p) => sum + (p.risk_score || 0), 0) /
      portfolios.length;

    return {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercentage: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
      avgRiskScore,
      portfolioCount: portfolios.length,
      profitablePortfolios: portfolios.filter(
        (p) => (p.total_profit_loss_usd || 0) > 0
      ).length,
      losingPortfolios: portfolios.filter(
        (p) => (p.total_profit_loss_usd || 0) < 0
      ).length,
    };
  };

  // Get top performing portfolios
  const getTopPerformers = (limit: number = 5) => {
    return [...portfolios]
      .sort(
        (a, b) =>
          (b.total_profit_loss_percentage || 0) -
          (a.total_profit_loss_percentage || 0)
      )
      .slice(0, limit);
  };

  // Get highest risk portfolios
  const getHighestRisk = (limit: number = 5) => {
    return [...portfolios]
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, limit);
  };

  return {
    // Data
    portfolios,
    isLoading,
    error,

    // Queries
    usePortfolio,
    usePortfolioLiveData,

    // Mutations
    createPortfolio: createPortfolioMutation.mutate,
    createPortfolioMutation,
    createPortfolioWithHoldings: createPortfolioWithHoldingsMutation.mutate,
    createPortfolioWithHoldingsMutation,
    updatePortfolio: updatePortfolioMutation.mutate,
    deletePortfolio: deletePortfolioMutation.mutate,

    // Mutation states
    isCreating: createPortfolioMutation.isPending,
    isCreatingWithHoldings: createPortfolioWithHoldingsMutation.isPending,
    isUpdating: updatePortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,

    // Real-time
    realTimeData,
    subscribeToPortfolio,
    unsubscribeFromPortfolio,

    // Utilities
    refetch,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
  };
}
